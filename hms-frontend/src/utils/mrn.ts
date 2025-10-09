// Utility to generate a random Medical Record Number with prefix and checksum-like tail
export function generateRandomMrn(prefix: string = 'MRN'): string {
  // 8 alphanumeric uppercase chars
  const core = Array.from({ length: 8 }, () => {
    const n = Math.floor(Math.random() * 36);
    return n.toString(36).toUpperCase();
  }).join('');
  return `${prefix}-${core}`;
}
