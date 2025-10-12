import axios from "axios";
import { API_V1_BASE } from "./baseUrls";


export const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID ?? ""; // no implicit tenant

export const apiClient = axios.create({
  baseURL: API_V1_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

let currentTenantId = "";

export function setTenantHeader(tenantId: string | null) {
  currentTenantId = tenantId ?? "";
  if (tenantId && tenantId.trim()) {
    apiClient.defaults.headers.common["X-Tenant-Id"] = tenantId.trim();
  } else {
    delete apiClient.defaults.headers.common["X-Tenant-Id"];
  }
}

export function getTenantHeader() {
  return currentTenantId;
}

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// Intentionally do not set a tenant header by default; it will be applied after successful login.

// Global error interceptor: extract error message from API error response
apiClient.interceptors.response.use(
  response => response,
  error => {
    // If the error response has the expected structure, extract the first error message
    if (
      error.response &&
      error.response.data &&
      error.response.data.errors &&
      Array.isArray(error.response.data.errors) &&
      error.response.data.errors.length > 0 &&
      error.response.data.errors[0].message
    ) {
      // Attach the message to the error object for easier access
      error.message = error.response.data.errors[0].message;
    }
    return Promise.reject(error);
  }
);
