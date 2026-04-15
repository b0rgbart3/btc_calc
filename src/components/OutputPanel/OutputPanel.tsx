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
