import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemSettingsApi, SystemSettingDto } from '../services/systemSettingsApi';

export interface SystemSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    timezone: 'Africa/Nairobi',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12',
    currency: 'USD',
    language: 'en'
  });

  // Get all system settings
  const { data: systemSettings = [], isLoading, error } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: systemSettingsApi.getAllSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (systemSettings && systemSettings.length > 0) {
      const settingsMap = systemSettings.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {} as Record<string, string>);

      setSettings({
        timezone: settingsMap['system.timezone'] || 'Africa/Nairobi',
        dateFormat: settingsMap['system.dateFormat'] || 'MM/dd/yyyy',
        timeFormat: settingsMap['system.timeFormat'] || '12',
        currency: settingsMap['system.currency'] || 'USD',
        language: settingsMap['system.language'] || 'en'
      });
    }
  }, [systemSettings]);

  const formatCurrency = (amount: number | string): string => {
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
  };

  const formatDate = (date: Date | string, format?: string): string => {
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
  };

  const formatTime = (date: Date | string, format?: string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const timeFormat = format || settings.timeFormat;
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12'
    };
    
    return d.toLocaleTimeString(settings.language, options);
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(d)} ${formatTime(d)}`;
  };

  const parseCurrency = (value: string): number => {
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
  };

  return {
    settings,
    loading: isLoading,
    error,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    parseCurrency,
    currencyCode: settings.currency,
    currencySymbol: settings.currency === 'USD' ? '$' : settings.currency,
    timezone: settings.timezone,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
    language: settings.language
  };
}
