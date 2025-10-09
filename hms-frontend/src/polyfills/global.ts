// Polyfill Node-style global for browser builds when some deps expect `global`.
// Safe no-op if it already exists.
// Import this before any library that references `global`.
if (typeof window !== 'undefined' && (window as any).global === undefined) {
  (window as any).global = window;
}
