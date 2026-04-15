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
 */
function computeAnnuityIncome(
  btcHeld: number,
  btcPrice: number,
  startYear: number,
  retireAge: number,
  lifeExpectancy: number,
  inflationRate: number,
  inputs: CalcInputs,
): number {
  const years = lifeExpectancy - retireAge;
  if (years <= 0 || btcHeld <= 0) return 0;

  let currentPrice = btcPrice;
  let btcWeightedSum = 0;

  for (let yr = 0; yr < years; yr++) {
    // Each drawdown year is one step ahead of retirement (retirement year has no spend),
    // so grow price first — this mirrors the main simulation exactly.
    currentPrice = currentPrice * (1 + getGrowthRate(startYear + 1 + yr, inputs));
    btcWeightedSum += Math.pow(1 + inflationRate, yr) / currentPrice;
  }

  return btcWeightedSum > 0 ? btcHeld / btcWeightedSum : 0;
}

export function useSimulation(
  inputs: CalcInputs,
  currentBtcPrice: number | null,
): SimulationResult | null {
  return useMemo(() => {
    if (currentBtcPrice === null || currentBtcPrice <= 0) return null;
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

    for (let year = 0; year <= totalYears; year++) {
      const age = inputs.currentAge + year;

      // Project BTC price for this year
      if (year > 0) {
        const growthRate = getGrowthRate(year, inputs);
        btcPrice = btcPrice * (1 + growthRate);
      }

      // Check retirement: find first year where annuity income >= desired income.
      // annuityIncome is the spending base that depletes BTC to exactly zero by
      // lifeExpectancy, so the drawdown will naturally reach zero.
      if (!retirementFound) {
        const yearsRemaining = inputs.lifeExpectancy - age;
        if (yearsRemaining > 0) {
          const annuityIncome = computeAnnuityIncome(
            btcHeld,
            btcPrice,
            year,
            age,
            inputs.lifeExpectancy,
            inflationRate,
            inputs,
          );
          if (annuityIncome >= inputs.desiredAnnualIncome) {
            retirementFound = true;
            retirementAge = age;
            totalBtcAtRetirement = btcHeld;
            btcPriceAtRetirement = btcPrice;
            retirementAnnuityBase = annuityIncome;
            annualBudgetBtc = annuityIncome / btcPrice;
            monthlyBudgetBtc = annualBudgetBtc / 12;
          }
        }
      }

      let annualSpendUsd = 0;
      let phase: DataPoint['phase'];

      if (age < retirementAge) {
        // Accumulation: buy more BTC this year
        if (inputs.annualBuyUsd > 0) {
          btcHeld = btcHeld + inputs.annualBuyUsd / btcPrice;
        }
        phase = 'accumulation';
      } else if (age === retirementAge) {
        // Retirement year is the peak — no buy, no sell.
        phase = 'accumulation';
      } else {
        // Drawdown: use annuity-derived base so BTC depletes to ~zero by life expectancy
        const yearsIntoRetirement = age - retirementAge - 1;
        annualSpendUsd =
          retirementAnnuityBase *
          Math.pow(1 + inflationRate, yearsIntoRetirement);
        btcHeld = Math.max(0, btcHeld - annualSpendUsd / btcPrice);
        phase = 'drawdown';
      }

      dataPoints.push({
        age,
        btcHeld,
        btcPrice,
        portfolioValueUsd: btcHeld * btcPrice,
        annualSpendUsd,
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
            ? inputs.desiredAnnualIncome / lastPoint.btcPrice
            : 0;
        monthlyBudgetBtc = annualBudgetBtc / 12;
      }
    }

    return {
      dataPoints,
      retirementAge,
      totalBtcAtRetirement,
      btcPriceAtRetirement,
      annualBudgetBtc,
      monthlyBudgetBtc,
      annualBudgetUsd: annualBudgetBtc * btcPriceAtRetirement,
      monthlyBudgetUsd: monthlyBudgetBtc * btcPriceAtRetirement,
    };
  }, [inputs, currentBtcPrice]);
}
