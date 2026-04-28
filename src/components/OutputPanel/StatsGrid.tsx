import type { SimulationResult } from '../../types';
import styles from './StatsGrid.module.scss';

interface StatsGridProps {
  result: SimulationResult | null;
  btcPrice: number | null;
  btcLoading: boolean;
}

function fmtBtc(v: number): string {
  return `₿${v.toFixed(8)}`;
}

function fmtUsd(v: number): string {
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

interface StatCardProps {
  label: string;
  value: string | null;
  valueAnnotation?: string | null;
  subValue?: string | null;
  color?: 'green' | 'orange' | 'white';
  isLive?: boolean;
  large?: boolean;
}

function StatCard({ label, value, valueAnnotation, subValue, color = 'white', isLive = false, large = false }: StatCardProps) {
  const valueClass = [
    styles.cardValue,
    color === 'green' ? styles.green : '',
    color === 'orange' ? styles.orange : '',
    large ? styles.large : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>
        {label}
        {isLive && (
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <span className={styles.liveBadge}>LIVE</span>
          </span>
        )}
      </span>
      {value !== null ? (
        <span className={valueClass}>
          {value}
          {valueAnnotation && (
            <span className={styles.cardValueAnnotation}>{valueAnnotation}</span>
          )}
        </span>
      ) : (
        <span className={styles.placeholder}>—</span>
      )}
      {subValue !== undefined && (
        value !== null ? (
          <span className={styles.cardSubValue}>{subValue}</span>
        ) : (
          <span className={styles.placeholder}>—</span>
        )
      )}
    </div>
  );
}

function BudgetCard({ result }: { result: SimulationResult | null }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>Budget</span>
      <div className={styles.budgetRow}>
        <span className={styles.budgetSection}>
          <span className={styles.budgetSectionLabel}>Annual</span>
          {result ? (
            <>
              <span className={`${styles.cardValue} ${styles.orange}`}>{fmtBtc(result.annualBudgetBtc)}</span>
              <span className={styles.cardSubValue}>{fmtUsd(result.annualBudgetUsd)}</span>
            </>
          ) : (
            <span className={styles.placeholder}>—</span>
          )}
        </span>
        <span className={styles.budgetDivider} />
        <span className={styles.budgetSection}>
          <span className={styles.budgetSectionLabel}>Monthly</span>
          {result ? (
            <>
              <span className={`${styles.cardValue} ${styles.orange}`}>{fmtBtc(result.monthlyBudgetBtc)}</span>
              <span className={styles.cardSubValue}>{fmtUsd(result.monthlyBudgetUsd)}</span>
            </>
          ) : (
            <span className={styles.placeholder}>—</span>
          )}
        </span>
      </div>
    </div>
  );
}

export function StatsGrid({ result, btcPrice, btcLoading }: StatsGridProps) {
  const priceValue = btcLoading && btcPrice === null
    ? null
    : btcPrice !== null
    ? fmtUsd(btcPrice)
    : null;

  return (
    <div className={styles.grid}>
      <StatCard
        label="Current Bitcoin Price"
        value={priceValue}
        color="green"
        isLive
      />
      <StatCard
        label="Your Retirement Age"
        value={result ? result.retirementAge.toString() : null}
        valueAnnotation={result ? (() => {
          const yearsAway = result.retirementAge - result.dataPoints[0].age;
          return yearsAway === 0 ? '(this year)' : `(in ${yearsAway} year${yearsAway !== 1 ? 's' : ''})`;
        })() : null}
        color="white"
        large
      />
      <StatCard
        label="Total BTC at Retirement"
        value={result ? fmtBtc(result.totalBtcAtRetirement) : null}
        color="orange"
      />
      <StatCard
        label="BTC Price at Retirement"
        value={result ? fmtUsd(result.btcPriceAtRetirement) : null}
        color="green"
      />
      <BudgetCard result={result} />
      <StatCard
        label="Legacy Estate"
        value={result ? fmtBtc(result.estateValueBtc) : null}
        subValue={result
          ? result.estateValueBtc > 0
            ? fmtUsd(result.estateValueUsd)
            : 'Stack fully drawn down'
          : null}
        color="orange"
      />
    </div>
  );
}
