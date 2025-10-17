import React from 'react';
import { useSystemSettings } from '../../hooks/useSystemSettings';

interface CurrencyDisplayProps {
  amount: number | string;
  className?: string;
  showCurrency?: boolean;
}

export function CurrencyDisplay({ amount, className, showCurrency = true }: CurrencyDisplayProps) {
  const { formatCurrency, loading } = useSystemSettings();

  if (loading) {
    return <span className={className}>Loading...</span>;
  }

  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  );
}

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder, className, disabled }: CurrencyInputProps) {
  const { formatCurrency, parseCurrency, loading, currencySymbol } = useSystemSettings();
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, formatCurrency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    const numericValue = parseCurrency(displayValue);
    setDisplayValue(formatCurrency(numericValue));
  };

  if (loading) {
    return (
      <input
        type="text"
        className={className}
        placeholder="Loading..."
        disabled
      />
    );
  }

  return (
    <div className="position-relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    </div>
  );
}
