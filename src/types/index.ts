export interface CalcInputs {
  currentAge: number;
  lifeExpectancy: number;
  btcHeld: number;
  annualBuyUsd: number;
  startGrowthPct: number;
  endGrowthPct: number;
  transitionYears: number;
  inflationPct: number;
  desiredAnnualIncome: number;
}

export interface DataPoint {
  age: number;
  btcHeld: number;
  btcPrice: number;
  portfolioValueUsd: number;
  annualSpendUsd: number;
  phase: 'accumulation' | 'drawdown';
}

export interface SimulationResult {
  dataPoints: DataPoint[];
  retirementAge: number;
  totalBtcAtRetirement: number;
  btcPriceAtRetirement: number;
  annualBudgetBtc: number;
  monthlyBudgetBtc: number;
  annualBudgetUsd: number;
  monthlyBudgetUsd: number;
}
