import { useState } from 'react';
import type { SimulationResult } from '../../types';
import { StatsGrid } from './StatsGrid';
import { ChartView } from './ChartView';
import { TableView } from './TableView';
import styles from './OutputPanel.module.scss';

type ViewMode = 'chart' | 'table';

interface OutputPanelProps {
  result: SimulationResult | null;
  btcPrice: number | null;
  btcLoading: boolean;
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1v8M4 6l3 3 3-3" />
      <path d="M1 11h12v2H1z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="1,10 4,6 7,8 10,3 13,5" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="12" height="12" rx="1" />
      <line x1="1" y1="5" x2="13" y2="5" />
      <line x1="5" y1="5" x2="5" y2="13" />
    </svg>
  );
}

function downloadCsv(result: SimulationResult) {
  const currentYear = new Date().getFullYear();
  const startAge = result.dataPoints.length > 0 ? result.dataPoints[0].age : 0;

  const headers = ['Year', 'Age', 'BTC Holdings', 'BTC Price (USD)', 'Portfolio Value (USD)', 'Annual Spend (USD)', 'Annual Spend (BTC)', 'Monthly Budget (USD)', 'Monthly Budget (BTC)'];
  const rows = result.dataPoints.map((dp) => [
    currentYear + (dp.age - startAge),
    dp.age,
    dp.btcHeld.toFixed(6),
    dp.btcPrice.toFixed(2),
    dp.portfolioValueUsd.toFixed(2),
    dp.annualSpendUsd > 0 ? dp.annualSpendUsd.toFixed(2) : '',
    dp.annualSpendUsd > 0 ? (dp.annualSpendUsd / dp.btcPrice).toFixed(8) : '',
    dp.annualSpendUsd > 0 ? (dp.annualSpendUsd / 12).toFixed(2) : '',
    dp.annualSpendUsd > 0 ? (dp.annualSpendUsd / 12 / dp.btcPrice).toFixed(8) : '',
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'btc-retirement-projection.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function OutputPanel({ result, btcPrice, btcLoading }: OutputPanelProps) {
  const [view, setView] = useState<ViewMode>('chart');

  return (
    <div className={styles.panel}>
      <StatsGrid result={result} btcPrice={btcPrice} btcLoading={btcLoading} />

      <div className={styles.viewToggle}>
        <span className={styles.toggleLabel}>View</span>
        <button
          className={`${styles.toggleBtn} ${view === 'chart' ? styles.active : ''}`}
          onClick={() => setView('chart')}
        >
          <ChartIcon />
          Chart
        </button>
        <button
          className={`${styles.toggleBtn} ${view === 'table' ? styles.active : ''}`}
          onClick={() => setView('table')}
        >
          <TableIcon />
          Table
        </button>
        <button
          className={styles.downloadBtn}
          onClick={() => result && downloadCsv(result)}
          disabled={!result}
          title="Download table as CSV"
        >
          <DownloadIcon />
          CSV
        </button>
      </div>

      <div className={styles.content}>
        {result ? (
          view === 'chart' ? (
            <ChartView
              dataPoints={result.dataPoints}
              retirementAge={result.retirementAge}
            />
          ) : (
            <TableView
              dataPoints={result.dataPoints}
              retirementAge={result.retirementAge}
            />
          )
        ) : (
          <div style={{ color: '#9ca3af', padding: '24px', textAlign: 'center' }}>
            {btcLoading ? 'Fetching Bitcoin price…' : 'Enter valid inputs to see your projection.'}
          </div>
        )}
      </div>
    </div>
  );
}
