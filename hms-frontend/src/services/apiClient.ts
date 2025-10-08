import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const DEFAULT_TENANT_ID = import.meta.env.VITE_TENANT_ID ?? "tenantA";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

let currentTenantId = DEFAULT_TENANT_ID;

export function setTenantHeader(tenantId: string) {
  currentTenantId = tenantId;
  apiClient.defaults.headers.common["X-Tenant-Id"] = tenantId;
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

setTenantHeader(DEFAULT_TENANT_ID);
