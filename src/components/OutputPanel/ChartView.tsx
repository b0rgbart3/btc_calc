import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { DataPoint } from '../../types';
import styles from './ChartView.module.scss';

interface ChartViewProps {
  dataPoints: DataPoint[];
  retirementAge: number;
}

interface ChartDataPoint {
  age: number;
  accumulation: number | null;
  drawdown: number | null;
  btcPrice: number;
  portfolioValueUsd: number;
  annualSpendUsd: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  const btcHeld = d.accumulation !== null ? d.accumulation : d.drawdown !== null ? d.drawdown : 0;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipAge}>Age {d.age}</div>
      <div className={styles.tooltipRow}>
        <span>BTC Holdings</span>
        <span>₿{btcHeld.toFixed(6)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>BTC Price</span>
        <span>${d.btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Portfolio</span>
        <span>${d.portfolioValueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      </div>
      {d.annualSpendUsd > 0 && (
        <div className={styles.tooltipRow}>
          <span>Annual Spend</span>
          <span>${d.annualSpendUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
      )}
    </div>
  );
}

export function ChartView({ dataPoints, retirementAge }: ChartViewProps) {
  const startAge = dataPoints[0]?.age ?? 0;
  const currentYear = new Date().getFullYear();

  const btc500kAge = dataPoints.find((dp) => dp.btcPrice >= 500_000)?.age ?? null;
  const btc500kYear = btc500kAge !== null ? currentYear + (btc500kAge - startAge) : null;

  const btcMillionAge = dataPoints.find((dp) => dp.btcPrice >= 1_000_000)?.age ?? null;
  const btcMillionYear = btcMillionAge !== null ? currentYear + (btcMillionAge - startAge) : null;

  const chartData: ChartDataPoint[] = dataPoints.map((dp) => ({
    age: dp.age,
    accumulation: dp.phase === 'accumulation' ? dp.btcHeld : dp.age === retirementAge ? dp.btcHeld : null,
    drawdown: dp.phase === 'drawdown' ? dp.btcHeld : dp.age === retirementAge ? dp.btcHeld : null,
    btcPrice: dp.btcPrice,
    portfolioValueUsd: dp.portfolioValueUsd,
    annualSpendUsd: dp.annualSpendUsd,
  }));

  const tickStyle = {
    fill: '#9ca3af',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  };

  const formatBtc = (v: number) => `₿${v.toFixed(2)}`;

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.orange}`} />
          Accumulation
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.green}`} />
          Drawdown
        </div>
        {btc500kAge !== null && (
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.sky}`} />
            BTC = $500K
          </div>
        )}
        {btcMillionAge !== null && (
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.amber}`} />
            BTC = $1M
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 52, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis
            dataKey="age"
            stroke="#404040"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: '#404040' }}
          />
          <YAxis
            stroke="#404040"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatBtc}
            tickCount={10}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={retirementAge}
            stroke="#4ade80"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{
              value: `Retire ${retirementAge}`,
              position: 'top',
              dy: -36,
              fill: '#4ade80',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
          {btc500kAge !== null && (
            <ReferenceLine
              x={btc500kAge}
              stroke="#38bdf8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `₿=$500K (${btc500kYear})`,
                position: 'top',
                dy: -22,
                fill: '#38bdf8',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          )}
          {btcMillionAge !== null && (
            <ReferenceLine
              x={btcMillionAge}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `₿=$1M (${btcMillionYear})`,
                position: 'top',
                dy: -8,
                fill: '#f59e0b',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          )}
          <Line
            dataKey="accumulation"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="drawdown"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4ade80', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
