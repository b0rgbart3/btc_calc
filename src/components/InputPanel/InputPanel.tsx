import type { CalcInputs } from "../../types";
import { NumberInput } from "./NumberInput";
import { SliderInput } from "./SliderInput";
import styles from "./InputPanel.module.scss";

interface InputPanelProps {
  inputs: CalcInputs;
  onChange: (patch: Partial<CalcInputs>) => void;
  computedIncome: number | null;
}

const fmtDollars = (v: number) => `$${v.toLocaleString("en-US")}`;
const fmtPct = (v: number) => `${v}%`;
const fmtPctDecimal = (v: number) => `${v.toFixed(1)}%`;
const fmtYrs = (v: number) => `${v} yr${v !== 1 ? "s" : ""}`;
const fmtBtc = (v: number) => `₿${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)}`;

export function InputPanel({
  inputs,
  onChange,
  computedIncome,
}: InputPanelProps) {
  const targetEnabled = inputs.targetRetirementAge !== null;

  function handleTargetToggle() {
    if (targetEnabled) {
      onChange({ targetRetirementAge: null });
    } else {
      const defaultTarget = Math.min(
        inputs.currentAge + 10,
        inputs.lifeExpectancy - 1,
      );
      onChange({ targetRetirementAge: defaultTarget });
    }
  }

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
          </div>
          <SliderInput
            label="Life Expectancy"
            value={inputs.lifeExpectancy}
            onChange={(v) => onChange({ lifeExpectancy: v })}
            min={75}
            max={125}
            step={1}
            formatValue={fmtYrs}
          />
          <SliderInput
            label="Current BTC Holdings"
            value={inputs.btcHeld}
            onChange={(v) => onChange({ btcHeld: v })}
            min={0}
            max={25}
            step={0.1}
            formatValue={fmtBtc}
            variant="orange"
          />
        </div>
      </section>

      {/* ANNUAL STRATEGY */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Annual Stacking Strategy</span>
        </div>
        <div className={styles.card}>
          <SliderInput
            label="Annual Stacking Amount"
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
            max={50}
            step={1}
            formatValue={fmtPct}
            variant="amber"
          />
          <SliderInput
            label="Ending Growth"
            value={inputs.endGrowthPct}
            onChange={(v) => onChange({ endGrowthPct: v })}
            min={0}
            max={100}
            step={1}
            formatValue={fmtPct}
            variant="gray"
          />
          <SliderInput
            label="Transition Period"
            value={inputs.transitionYears}
            onChange={(v) => onChange({ transitionYears: v })}
            min={1}
            max={30}
            step={1}
            formatValue={fmtYrs}
            variant="gray"
          />
        </div>
      </section>

      {/* RETIREMENT GOALS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>In Retirement</span>
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
            variant="sky"
          />
          <SliderInput
            label="Desired Annual Income"
            value={
              computedIncome !== null
                ? Math.round(computedIncome / 1000) * 1000
                : inputs.desiredAnnualIncome
            }
            onChange={(v) => onChange({ desiredAnnualIncome: v })}
            min={0}
            max={500000}
            step={1000}
            formatValue={fmtDollars}
            disabled={computedIncome !== null}
          />
          <SliderInput
            label="Capital Gains Tax Rate"
            value={inputs.capitalGainsTaxPct}
            onChange={(v) => onChange({ capitalGainsTaxPct: v })}
            min={0}
            max={50}
            step={1}
            formatValue={fmtPct}
            variant="sky"
          />
        </div>
      </section>

      {/* TARGET RETIREMENT AGE */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            Fixed Target Retirement Age
          </span>
          <button
            className={`${styles.toggleBtn} ${targetEnabled ? styles.toggleBtnOn : ""}`}
            onClick={handleTargetToggle}
            aria-label={
              targetEnabled
                ? "Disable target retirement age"
                : "Enable target retirement age"
            }
          />
        </div>
        {targetEnabled && inputs.targetRetirementAge !== null && (
          <div className={styles.card}>
            <SliderInput
              label="Retire at Age"
              value={inputs.targetRetirementAge}
              onChange={(v) => onChange({ targetRetirementAge: v })}
              min={inputs.currentAge}
              max={inputs.lifeExpectancy - 1}
              step={1}
              formatValue={(v) => `${v}`}
              variant="gray"
            />
          </div>
        )}
      </section>
    </aside>
  );
}
