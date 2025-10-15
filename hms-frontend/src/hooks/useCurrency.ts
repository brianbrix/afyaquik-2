import { useQuery } from '@tanstack/react-query';
import { currencyApi } from '../services/currencyApi';

/**
 * Hook for currency formatting and management.
 */
export function useCurrency() {
  // Get default currency
  const { data: defaultCurrency, isLoading } = useQuery({
    queryKey: ['defaultCurrency'],
    queryFn: currencyApi.getDefaultCurrency,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Format a number as currency using the default currency.
   */
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) {
      return '0.00';
    }

    if (!defaultCurrency) {
      // Fallback formatting
      return `$${amount.toFixed(2)}`;
    }

    const symbol = defaultCurrency.symbol;
    const decimalPlaces = defaultCurrency.decimalPlaces;
    const formattedAmount = amount.toFixed(decimalPlaces);
    
    return `${symbol}${formattedAmount}`;
  };

  /**
   * Format a number as currency with custom symbol and decimal places.
   */
  const formatCurrencyCustom = (
    amount: number | null | undefined, 
    symbol?: string, 
    decimalPlaces?: number
  ): string => {
    if (amount === null || amount === undefined) {
      return '0.00';
    }

    const currencySymbol = symbol || defaultCurrency?.symbol || '$';
    const places = decimalPlaces !== undefined ? decimalPlaces : (defaultCurrency?.decimalPlaces || 2);
    const formattedAmount = amount.toFixed(places);
    
    return `${currencySymbol}${formattedAmount}`;
  };

  /**
   * Get currency symbol.
   */
  const getCurrencySymbol = (): string => {
    return defaultCurrency?.symbol || '$';
  };

  /**
   * Get decimal places.
   */
  const getDecimalPlaces = (): number => {
    return defaultCurrency?.decimalPlaces || 2;
  };

  return {
    defaultCurrency,
    isLoading,
    formatCurrency,
    formatCurrencyCustom,
    getCurrencySymbol,
    getDecimalPlaces,
  };
}
