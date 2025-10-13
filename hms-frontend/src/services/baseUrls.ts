// Centralized base URLs for API and WebSocket

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const API_V1_BASE = `${API_BASE_URL}/api/v1`;

export const WS_BASE_URL = `${API_BASE_URL}/ws`;
 
// If you want to use SockJS, you can use the HTTP(S) base, e.g. `${API_BASE_URL}/ws`
