import type { CalcInputs } from '../../types';
import { NumberInput } from './NumberInput';
import { SliderInput } from './SliderInput';
import styles from './InputPanel.module.scss';

interface InputPanelProps {
  inputs: CalcInputs;
  onChange: (patch: Partial<CalcInputs>) => void;
}

const fmtDollars = (v: number) => `$${v.toLocaleString('en-US')}`;
const fmtPct = (v: number) => `${v}%`;
const fmtPctDecimal = (v: number) => `${v.toFixed(1)}%`;
const fmtYrs = (v: number) => `${v} yr${v !== 1 ? 's' : ''}`;
const fmtBtc = (v: number) => `₿${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)}`;

export function InputPanel({ inputs, onChange }: InputPanelProps) {
  return (
    <aside className={styles.panel}>
      {/* YOUR PROFILE */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Your Profile</span>
        </div>
        <div className={styles.card}>
          <div className={styles.row}>
            <NumberInput
              label="Current Age"
              value={inputs.currentAge}
              onChange={(v) => onChange({ currentAge: v })}
              min={18}
              max={100}
              step={1}
            />
            <NumberInput
              label="Life Expectancy"
              value={inputs.lifeExpectancy}
              onChange={(v) => onChange({ lifeExpectancy: v })}
              min={50}
              max={120}
              step={1}
            />
          </div>
          <SliderInput
            label="BTC Holdings"
            value={inputs.btcHeld}
            onChange={(v) => onChange({ btcHeld: v })}
            min={0}
            max={25}
            step={0.1}
            formatValue={fmtBtc}
          />
        </div>
      </section>

      {/* ANNUAL STRATEGY */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Annual Strategy</span>
        </div>
        <div className={styles.card}>
          <SliderInput
            label="Annual Buy"
            value={inputs.annualBuyUsd}
            onChange={(v) => onChange({ annualBuyUsd: v })}
            min={0}
            max={200000}
            step={500}
            formatValue={fmtDollars}
          />
        </div>
      </section>

      {/* PRICE GROWTH MODEL */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Price Growth Model</span>
        </div>
        <div className={styles.card}>
          <SliderInput
            label="Starting Growth"
            value={inputs.startGrowthPct}
            onChange={(v) => onChange({ startGrowthPct: v })}
            min={0}
            max={100}
            step={1}
            formatValue={fmtPct}
          />
          <SliderInput
            label="Ending Growth"
            value={inputs.endGrowthPct}
            onChange={(v) => onChange({ endGrowthPct: v })}
            min={0}
            max={100}
            step={1}
            formatValue={fmtPct}
          />
          <SliderInput
            label="Transition Period"
            value={inputs.transitionYears}
            onChange={(v) => onChange({ transitionYears: v })}
            min={1}
            max={30}
            step={1}
            formatValue={fmtYrs}
          />
        </div>
      </section>

      {/* RETIREMENT GOALS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Retirement Goals</span>
        </div>
        <div className={styles.card}>
          <SliderInput
            label="Annual Inflation"
            value={inputs.inflationPct}
            onChange={(v) => onChange({ inflationPct: v })}
            min={0}
            max={20}
            step={0.5}
            formatValue={fmtPctDecimal}
          />
          <SliderInput
            label="Desired Annual Income"
            value={inputs.desiredAnnualIncome}
            onChange={(v) => onChange({ desiredAnnualIncome: v })}
            min={0}
            max={500000}
            step={1000}
            formatValue={fmtDollars}
          />
        </div>
      </section>
    </aside>
  );
}
