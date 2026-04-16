import styles from './SliderInput.module.scss';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (v: number) => string;
  sublabel?: string;
  variant?: 'orange' | 'sky' | 'amber' | 'gray';
  disabled?: boolean;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue = (v) => v.toString(),
  sublabel,
  variant,
  disabled = false,
}: SliderInputProps) {
  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <div className={[
      styles.wrapper,
      variant ? styles[variant] : '',
      disabled ? styles.disabled : '',
    ].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div>
          <span className={styles.label}>{label}</span>
          {sublabel && <span className={styles.sublabel}> — {sublabel}</span>}
        </div>
        <div className={styles.valueGroup}>
          {disabled && <span className={styles.autoBadge}>AUTO</span>}
          <span className={styles.value}>{formatValue(value)}</span>
        </div>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill-pct': `${fillPct}%` } as React.CSSProperties}
        disabled={disabled}
      />
    </div>
  );
}
