import { useSystemSettings } from './useSystemSettings';

/**
 * @deprecated Use useSystemSettings instead for currency formatting
 * This hook is kept for backward compatibility but now uses system settings
 */
export function useCurrency() {
  const { 
    formatCurrency, 
    parseCurrency, 
    currencyCode, 
    currencySymbol, 
    loading, 
    error 
  } = useSystemSettings();

  return {
    defaultCurrency: null, // Deprecated
    loading,
    error,
    formatCurrency,
    parseCurrency,
    currencyCode,
    currencySymbol,
    decimalPlaces: 2 // Default to 2 decimal places
  };
}
