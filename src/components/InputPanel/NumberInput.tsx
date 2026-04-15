import { useState, useEffect } from 'react';
import styles from './NumberInput.module.scss';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  decimalPlaces = 0,
}: NumberInputProps) {
  const [raw, setRaw] = useState(value.toString());

  useEffect(() => {
    setRaw(decimalPlaces > 0 ? value.toFixed(decimalPlaces) : value.toString());
  }, [value, decimalPlaces]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(e.target.value);
  }

  function handleBlur() {
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
      setRaw(decimalPlaces > 0 ? clamped.toFixed(decimalPlaces) : clamped.toString());
    } else {
      setRaw(decimalPlaces > 0 ? value.toFixed(decimalPlaces) : value.toString());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputRow}>
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input
          className={styles.input}
          type="number"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </div>
    </div>
  );
}
