// Centralized base URLs for API and WebSocket

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
export const API_V1_BASE = API_BASE_URL;

// Compute WS base so that in dev it targets the backend origin, not Vite (5173)
function computeWsBase(): string {
  // Allow explicit override
  const override = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (override && override.trim()) return override.trim();

  try {
    // Derive the backend origin from API_BASE_URL, even if API_BASE_URL is relative
    const apiUrl = new URL(API_BASE_URL, window.location.origin);
    // SockJS uses http/https, not ws/wss directly
    return `${apiUrl.protocol}//${apiUrl.host}/ws`;
  } catch {
    // Fallback to relative path (works in prod behind proxy)
    return "/ws";
  }
}

export const WS_BASE_URL = computeWsBase();
 
// If you want to use SockJS, you can use the HTTP(S) base, e.g. `${API_BASE_URL}/ws`
