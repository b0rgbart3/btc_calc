import { useState } from 'react';
import type { CalcInputs } from './types';
import { useBtcPrice } from './hooks/useBtcPrice';
import { useSimulation } from './hooks/useSimulation';
import { InputPanel } from './components/InputPanel/InputPanel';
import { OutputPanel } from './components/OutputPanel/OutputPanel';
import styles from './App.module.scss';

const DEFAULT_INPUTS: CalcInputs = {
  currentAge: 35,
  lifeExpectancy: 90,
  btcHeld: 0.5,
  annualBuyUsd: 12000,
  startGrowthPct: 60,
  endGrowthPct: 15,
  transitionYears: 8,
  inflationPct: 3,
  desiredAnnualIncome: 80000,
};

function App() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const { price, loading, error } = useBtcPrice();
  const result = useSimulation(inputs, price);

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
        <InputPanel inputs={inputs} onChange={handleChange} />
        <OutputPanel result={result} btcPrice={price} btcLoading={loading} />
      </main>
    </div>
  );
}

export default App;
