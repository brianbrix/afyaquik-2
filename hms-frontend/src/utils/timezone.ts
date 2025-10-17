import { SystemSettings } from '../hooks/useSystemSettings';

// Utility for converting to system timezone ISO string
export function toSystemTimezoneIsoString(date: Date | string, settings: SystemSettings): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Get timezone offset for the system timezone
  const utc = new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
  const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: settings.timezone }));
  const tzOffset = (targetTime.getTime() - utc.getTime()) / 60000;
  
  const local = new Date(d.getTime() + (d.getTimezoneOffset() - tzOffset) * 60000);
  // Format as ISO string with timezone offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const offsetHours = Math.floor(Math.abs(tzOffset) / 60);
  const offsetMinutes = Math.abs(tzOffset) % 60;
  const offsetSign = tzOffset >= 0 ? '+' : '-';
  
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`;
}

// Utility for formatting dates in day format with time using system settings
export function toDayFormat(date: Date | string, settings?: SystemSettings): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Use system timezone or default to Africa/Nairobi
  const timezone = settings?.timezone || 'Africa/Nairobi';
  const hour12 = settings?.timeFormat === '12' || true; // Default to 12-hour format
  
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: timezone
  });
  
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: hour12,
    timeZone: timezone
  });
  
  return `${dateStr} at ${timeStr}`;
}

// Legacy function for backward compatibility
export function toNairobiIsoString(date: Date | string): string {
  const defaultSettings: SystemSettings = {
    timezone: 'Africa/Nairobi',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12',
    currency: 'USD',
    language: 'en'
  };
  return toSystemTimezoneIsoString(date, defaultSettings);
}
