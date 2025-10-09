import { apiClient } from "./apiClient";
import { useQuery } from '@tanstack/react-query';
import type { RolesResponse, DepartmentsResponse } from "../types/reference";

interface ApiEnvelope<T> { status: string; data: T }
function unwrap<T>(payload: any): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

// Accept both legacy shapes ({key,name}/{id,name}) and normalized shapes ({roleKey,displayName}/{departmentId,displayName})
function normalizeRoles(raw: any[]): RolesResponse {
  if (!Array.isArray(raw)) return [];
  return raw.map(r => ({
    roleKey: r.roleKey ?? r.key ?? r.id ?? '',
    displayName: r.displayName ?? r.name ?? r.roleKey ?? r.key ?? r.id ?? ''
  })).filter(r => r.roleKey);
}

function normalizeDepartments(raw: any[]): DepartmentsResponse {
  if (!Array.isArray(raw)) return [];
  return raw.map(d => ({
    departmentId: d.departmentId ?? d.id ?? '',
    displayName: d.displayName ?? d.name ?? d.departmentId ?? d.id ?? ''
  })).filter(d => d.departmentId);
}

export async function fetchRoles(): Promise<RolesResponse> {
  const response = await apiClient.get("/api/v1/reference/roles");
  const raw = unwrap<any[]>(response.data);
  return normalizeRoles(raw);
}

export async function fetchDepartments(): Promise<DepartmentsResponse> {
  const response = await apiClient.get("/api/v1/reference/departments");
  const raw = unwrap<any[]>(response.data);
  return normalizeDepartments(raw);
}

export function useRoles(enabled: boolean = true) {
  return useQuery({ queryKey: ['reference','roles'], queryFn: fetchRoles, enabled });
}

export function useDepartments(enabled: boolean = true) {
  return useQuery({ queryKey: ['reference','departments'], queryFn: fetchDepartments, enabled });
}
