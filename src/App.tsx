import { useState } from 'react';
import type { CalcInputs } from './types';
import { useBtcPrice } from './hooks/useBtcPrice';
import { useSimulation } from './hooks/useSimulation';
import { InputPanel } from './components/InputPanel/InputPanel';
import { OutputPanel } from './components/OutputPanel/OutputPanel';
import styles from './App.module.scss';

const FALLBACK_BTC_PRICE = 85000;

const DEFAULT_INPUTS: CalcInputs = {
  currentAge: 45,
  lifeExpectancy: 90,
  btcHeld: 0.5,
  annualBuyUsd: 1000,
  startGrowthPct: 30,
  endGrowthPct: 7,
  transitionYears: 21,
  inflationPct: 7,
  desiredAnnualIncome: 80000,
  capitalGainsTaxPct: 15,
  additionalMonthlyIncome: 0,
  targetRetirementAge: null,
};

function App() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const { price, loading, error } = useBtcPrice();
  const result = useSimulation(inputs, price ?? FALLBACK_BTC_PRICE);

  function handleChange(patch: Partial<CalcInputs>) {
    setInputs((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className={styles.appLayout}>
      <header className={styles.header}>
        <span className={styles.logo}>₿</span>
        <h1 className={styles.title}>Bitcoin Retirement Calculator</h1>
        {error && <span className={styles.apiError}>Price API Unavailable</span>}
      </header>
      <main className={styles.main}>
        <InputPanel
          inputs={inputs}
          onChange={handleChange}
          computedIncome={inputs.targetRetirementAge !== null ? (result?.annualBudgetUsd ?? null) : null}
        />
        <OutputPanel result={result} btcPrice={price ?? FALLBACK_BTC_PRICE} btcLoading={loading} />
      </main>
    </div>
  );
}

export default App;
