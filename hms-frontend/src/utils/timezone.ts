// Utility for converting to Africa/Nairobi ISO string
export function toNairobiIsoString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Africa/Nairobi is always UTC+3, no DST
  const tzOffset = -180; // minutes
  const local = new Date(d.getTime() + (d.getTimezoneOffset() - tzOffset) * 60000);
  // Format as ISO string with +03:00 offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}+03:00`;
}
