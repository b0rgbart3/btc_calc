import type { DataPoint } from '../../types';
import styles from './TableView.module.scss';

interface TableViewProps {
  dataPoints: DataPoint[];
  retirementAge: number;
}

function fmtBtc(v: number) {
  return `₿${v.toFixed(6)}`;
}

function fmtUsd(v: number) {
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function TableView({ dataPoints, retirementAge }: TableViewProps) {
  const currentYear = new Date().getFullYear();
  const startAge = dataPoints.length > 0 ? dataPoints[0].age : 0;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Year</th>
            <th className={styles.th}>Age</th>
            <th className={styles.th}>BTC Holdings</th>
            <th className={styles.th}>BTC Price</th>
            <th className={styles.th}>Portfolio Value</th>
            <th className={styles.th}>Annual Spend</th>
            <th className={styles.th}>Monthly Budget</th>
          </tr>
        </thead>
        <tbody>
          {dataPoints.map((dp) => {
            const isRetirement = dp.age === retirementAge;
            const trClass = [styles.tr, isRetirement ? styles.retirementRow : '']
              .filter(Boolean)
              .join(' ');

            return (
              <tr key={dp.age} className={trClass}>
                <td className={styles.td}>{currentYear + (dp.age - startAge)}</td>
                <td className={styles.td}>
                  {isRetirement ? (
                    <span className={styles.retirementBadge}>
                      {dp.age}
                      <span className={styles.badge}>RETIRE</span>
                    </span>
                  ) : (
                    dp.age
                  )}
                </td>
                <td className={`${styles.td} ${styles.orange}`}>
                  {fmtBtc(dp.btcHeld)}
                </td>
                <td className={`${styles.td} ${styles.green}`}>
                  {fmtUsd(dp.btcPrice)}
                </td>
                <td className={styles.td}>
                  {fmtUsd(dp.portfolioValueUsd)}
                </td>
                <td className={styles.td}>
                  {dp.annualSpendUsd > 0 ? fmtUsd(dp.annualSpendUsd) : '—'}
                </td>
                <td className={styles.td}>
                  {dp.annualSpendUsd > 0 ? fmtUsd(dp.annualSpendUsd / 12) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
