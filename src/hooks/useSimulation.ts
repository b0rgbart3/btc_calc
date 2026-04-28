import { useMemo } from 'react';
import type { CalcInputs, DataPoint, SimulationResult } from '../types';

function getGrowthRate(year: number, inputs: CalcInputs): number {
  const { startGrowthPct, endGrowthPct, transitionYears } = inputs;
  if (transitionYears <= 0 || year >= transitionYears) {
    return endGrowthPct / 100;
  }
  const t = year / transitionYears;
  const interpolated = startGrowthPct + t * (endGrowthPct - startGrowthPct);
  return interpolated / 100;
}

/**
 * Computes the inflation-adjusted annuity income whose BTC cost exactly
 * equals btcHeld by life expectancy, given projected BTC price growth.
 * Returns the base (year-0) USD annual income that depletes holdings to zero.
 *
 * With tax, each dollar of desired after-tax spending requires selling
 * 1/(1 - taxRate) dollars of BTC (simplified full-gain assumption).
 */
function computeAnnuityIncome(
  btcHeld: number,
  btcPrice: number,
  startYear: number,
  retireAge: number,
  lifeExpectancy: number,
  inflationRate: number,
  taxRate: number,
  inputs: CalcInputs,
): number {
  const years = lifeExpectancy - retireAge;
  if (years <= 0 || btcHeld <= 0) return 0;

  const taxFactor = taxRate > 0 ? 1 / (1 - taxRate) : 1;
  let currentPrice = btcPrice;
  let btcWeightedSum = 0;

  for (let yr = 0; yr < years; yr++) {
    // Each drawdown year is one step ahead of retirement (retirement year has no spend),
    // so grow price first — this mirrors the main simulation exactly.
    currentPrice = currentPrice * (1 + getGrowthRate(startYear + 1 + yr, inputs));
    btcWeightedSum += (Math.pow(1 + inflationRate, yr) * taxFactor) / currentPrice;
  }

  return btcWeightedSum > 0 ? btcHeld / btcWeightedSum : 0;
}

export function simulate(inputs: CalcInputs, currentBtcPrice: number): SimulationResult | null {
  if (currentBtcPrice <= 0) return null;
  if (inputs.lifeExpectancy <= inputs.currentAge) return null;

  const dataPoints: DataPoint[] = [];
  let btcHeld = inputs.btcHeld;
  let btcPrice = currentBtcPrice;
  let retirementAge = inputs.lifeExpectancy;
  let retirementFound = false;
  let totalBtcAtRetirement = 0;
  let btcPriceAtRetirement = currentBtcPrice;
  let annualBudgetBtc = 0;
  let monthlyBudgetBtc = 0;
  let retirementAnnuityBase = 0;

  const totalYears = inputs.lifeExpectancy - inputs.currentAge;
  const inflationRate = inputs.inflationPct / 100;
  const taxRate = inputs.capitalGainsTaxPct / 100;
  const additionalAnnualIncome = inputs.additionalMonthlyIncome * 12;
  // How much BTC drawdown is needed after accounting for additional income sources
  const effectiveBtcDesired = Math.max(0, inputs.desiredAnnualIncome - additionalAnnualIncome);

  // Track weighted average cost basis (starting at current price for existing holdings)
  let avgCostBasis = currentBtcPrice;

  for (let year = 0; year <= totalYears; year++) {
    const age = inputs.currentAge + year;

    // Project BTC price for this year
    if (year > 0) {
      const growthRate = getGrowthRate(year, inputs);
      btcPrice = btcPrice * (1 + growthRate);
    }

    // Check retirement. Two modes:
    // 1. Target mode: force retirement at a specific age, solve for max income.
    // 2. Normal mode: find first year where annuity income >= desired income.
    if (!retirementFound) {
      const yearsRemaining = inputs.lifeExpectancy - age;
      if (yearsRemaining > 0) {
        const isTargetYear = inputs.targetRetirementAge !== null && age === inputs.targetRetirementAge;
        const annuityIncome = (isTargetYear || inputs.targetRetirementAge === null)
          ? computeAnnuityIncome(btcHeld, btcPrice, year, age, inputs.lifeExpectancy, inflationRate, taxRate, inputs)
          : 0;

        const shouldRetire = isTargetYear || (inputs.targetRetirementAge === null && annuityIncome >= effectiveBtcDesired);

        if (shouldRetire) {
          retirementFound = true;
          retirementAge = age;
          totalBtcAtRetirement = btcHeld;
          btcPriceAtRetirement = btcPrice;
          // Cap BTC drawdown to what's actually needed (additional income covers the rest)
          retirementAnnuityBase = Math.min(annuityIncome, effectiveBtcDesired);
          annualBudgetBtc = retirementAnnuityBase / btcPrice;
          monthlyBudgetBtc = annualBudgetBtc / 12;
        }
      }
    }

    let annualSpendUsd = 0;
    let taxPaidUsd = 0;
    let phase: DataPoint['phase'];

    if (age < retirementAge) {
      // Accumulation: buy more BTC this year, update weighted average cost basis
      if (inputs.annualBuyUsd > 0) {
        const newBtc = (inputs.annualBuyUsd * 12) / btcPrice;
        avgCostBasis = (btcHeld * avgCostBasis + newBtc * btcPrice) / (btcHeld + newBtc);
        btcHeld = btcHeld + newBtc;
      }
      phase = 'accumulation';
    } else if (age === retirementAge) {
      // Retirement year is the peak — no buy, no sell.
      phase = 'accumulation';
    } else {
      // Drawdown: sell enough BTC to cover desired after-tax spend plus capital gains tax.
      // gainFraction = proportion of each sale that is taxable gain.
      const yearsIntoRetirement = age - retirementAge - 1;
      annualSpendUsd =
        retirementAnnuityBase *
        Math.pow(1 + inflationRate, yearsIntoRetirement);

      const gainFraction = btcPrice > avgCostBasis
        ? Math.min(1, (btcPrice - avgCostBasis) / btcPrice)
        : 0;
      const effectiveTaxRate = taxRate * gainFraction;
      const grossSaleUsd = effectiveTaxRate < 1
        ? annualSpendUsd / (1 - effectiveTaxRate)
        : annualSpendUsd;
      taxPaidUsd = grossSaleUsd - annualSpendUsd;

      btcHeld = Math.max(0, btcHeld - grossSaleUsd / btcPrice);
      phase = 'drawdown';
    }

    dataPoints.push({
      age,
      btcHeld,
      btcPrice,
      portfolioValueUsd: btcHeld * btcPrice,
      annualSpendUsd,
      taxPaidUsd,
      phase,
    });
  }

  // If retirement was never found, compute stats at life expectancy
  if (!retirementFound) {
    const lastPoint = dataPoints[dataPoints.length - 1];
    if (lastPoint) {
      totalBtcAtRetirement = lastPoint.btcHeld;
      btcPriceAtRetirement = lastPoint.btcPrice;
      annualBudgetBtc =
        lastPoint.btcHeld > 0
          ? effectiveBtcDesired / lastPoint.btcPrice
          : 0;
      monthlyBudgetBtc = annualBudgetBtc / 12;
    }
  }

  const lastPoint = dataPoints[dataPoints.length - 1];
  const estateValueBtc = lastPoint ? lastPoint.btcHeld : 0;
  const estateValueUsd = lastPoint ? lastPoint.portfolioValueUsd : 0;

  return {
    dataPoints,
    retirementAge,
    totalBtcAtRetirement,
    btcPriceAtRetirement,
    annualBudgetBtc,
    monthlyBudgetBtc,
    // USD totals include additional monthly income so they reflect true spending power
    annualBudgetUsd: annualBudgetBtc * btcPriceAtRetirement + additionalAnnualIncome,
    monthlyBudgetUsd: monthlyBudgetBtc * btcPriceAtRetirement + additionalAnnualIncome / 12,
    estateValueBtc,
    estateValueUsd,
  };
}

export function useSimulation(
  inputs: CalcInputs,
  currentBtcPrice: number | null,
): SimulationResult | null {
  return useMemo(() => {
    if (currentBtcPrice === null) return null;
    return simulate(inputs, currentBtcPrice);
  }, [inputs, currentBtcPrice]);
}

