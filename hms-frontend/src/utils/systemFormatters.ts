import { SystemSettings } from '../hooks/useSystemSettings';

/**
 * Format currency using system settings
 */
export function formatCurrencyWithSettings(amount: number | string, settings: SystemSettings): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return amount.toString();
  
  // Get currency symbol based on currency code
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'KES': 'KSh',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  
  const symbol = currencySymbols[settings.currency] || settings.currency;
  return `${symbol}${numAmount.toFixed(2)}`;
}

/**
 * Format date using system settings
 */
export function formatDateWithSettings(date: Date | string, settings: SystemSettings, format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateFormat = format || settings.dateFormat;
  
  // Convert format string to Intl.DateTimeFormat options
  const options: Intl.DateTimeFormatOptions = {
    timeZone: settings.timezone
  };
  
  if (dateFormat.includes('MM')) {
    options.month = '2-digit';
  } else if (dateFormat.includes('M')) {
    options.month = 'short';
  }
  
  if (dateFormat.includes('dd')) {
    options.day = '2-digit';
  } else if (dateFormat.includes('d')) {
    options.day = 'numeric';
  }
  
  if (dateFormat.includes('yyyy')) {
    options.year = 'numeric';
  } else if (dateFormat.includes('yy')) {
    options.year = '2-digit';
  }
  
  return d.toLocaleDateString(settings.language, options);
}

/**
 * Format time using system settings
 */
export function formatTimeWithSettings(date: Date | string, settings: SystemSettings, format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const timeFormat = format || settings.timeFormat;
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: settings.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12'
  };
  
  return d.toLocaleTimeString(settings.language, options);
}

/**
 * Format date and time using system settings
 */
export function formatDateTimeWithSettings(date: Date | string, settings: SystemSettings): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDateWithSettings(d, settings)} ${formatTimeWithSettings(d, settings)}`;
}

/**
 * Parse currency value using system settings
 */
export function parseCurrencyWithSettings(value: string, settings: SystemSettings): number {
  if (!settings.currency) return parseFloat(value) || 0;
  
  // Remove currency symbol and parse
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'KES': 'KSh',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  
  const symbol = currencySymbols[settings.currency] || settings.currency;
  let cleanValue = value.replace(symbol, '');
  return parseFloat(cleanValue) || 0;
}

/**
 * Convert date to timezone-aware string
 */
export function toTimezoneString(date: Date | string, settings: SystemSettings): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to the system timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: settings.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: settings.timeFormat === '12'
  };
  
  return d.toLocaleString(settings.language, options);
}

/**
 * Get timezone offset for the system timezone
 */
export function getTimezoneOffset(settings: SystemSettings): number {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: settings.timezone }));
  return (targetTime.getTime() - utc.getTime()) / 60000;
}
