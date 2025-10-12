import { apiClient } from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiEnvelope<T> { status: string; data: T; errors?: any; meta?: any }

// ---- Types ----
export interface FeatureFlag { id: number; flagKey: string; enabled: boolean; description?: string }
export interface FormDefinition { id: number; formKey: string; schemaJson: string; version: number }
export interface TenantTheme { id: number; primaryColor?: string; logoUrl?: string; updatedBy?: string; defaultTheme?: boolean }

// Provide a UI-level fallback if backend call fails entirely
const UI_FALLBACK_THEME: TenantTheme = { id: 0, primaryColor: '#0d9488', logoUrl: '/static/logo-default.svg', updatedBy: 'system', defaultTheme: true };

// ---- Raw API ----
export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  const res = await apiClient.get<ApiEnvelope<FeatureFlag[]>>('/config/features');
  return res.data.data;
}
export async function upsertFeatureFlag(params: { key: string; enabled: boolean; description?: string }): Promise<FeatureFlag> {
  const { key, enabled, description } = params;
  const url = `/config/features/${encodeURIComponent(key)}?enabled=${enabled}${description ? `&description=${encodeURIComponent(description)}` : ''}`;
  const res = await apiClient.post<ApiEnvelope<FeatureFlag>>(url);
  return res.data.data;
}

export async function fetchFormDefinition(formKey: string): Promise<FormDefinition | null> {
  const res = await apiClient.get<ApiEnvelope<FormDefinition | null>>(`/config/forms/${encodeURIComponent(formKey)}`);
  return res.data.data;
}
export async function createFormVersion(formKey: string, schemaJson: string): Promise<FormDefinition> {
  const res = await apiClient.post<ApiEnvelope<FormDefinition>>(`/config/forms/${encodeURIComponent(formKey)}`, { schemaJson });
  return res.data.data;
}

export async function fetchTenantTheme(): Promise<TenantTheme | null> {
  try {
    const res = await apiClient.get<ApiEnvelope<TenantTheme | null>>('/config/theme');
    const data = res.data.data;
    if (!data) return UI_FALLBACK_THEME; // should not happen now, backend returns default
    // if backend meta marks default
    const meta = (res.data as any).meta;
    if (meta?.default) {
      return { ...data, defaultTheme: true };
    }
    return data;
  } catch (e) {
    return UI_FALLBACK_THEME; // network or other failure
  }
}
export async function updateTenantTheme(payload: { primaryColor?: string; logoUrl?: string; updatedBy?: string }): Promise<TenantTheme> {
  const res = await apiClient.post<ApiEnvelope<TenantTheme>>('/config/theme', payload);
  return res.data.data;
}

// ---- Hooks ----
export function useFeatureFlags(enabled: boolean = true) {
  return useQuery({ queryKey: ['config','features'], queryFn: fetchFeatureFlags, staleTime: 60_000, enabled });
}
export function useUpsertFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: upsertFeatureFlag, onSuccess: () => qc.invalidateQueries({ queryKey: ['config','features'] }) });
}

export function useFormSchema(formKey: string, enabled: boolean = true) {
  return useQuery({ queryKey: ['config','form', formKey], queryFn: () => fetchFormDefinition(formKey), enabled: !!formKey && enabled });
}
export function useCreateFormVersion(formKey: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (schemaJson: string) => createFormVersion(formKey, schemaJson), onSuccess: () => qc.invalidateQueries({ queryKey: ['config','form', formKey] }) });
}

export function useTenantTheme(enabled: boolean = true) {
  return useQuery({ queryKey: ['config','theme'], queryFn: fetchTenantTheme, staleTime: 300_000, enabled });
}
export function useUpdateTenantTheme() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateTenantTheme, onSuccess: () => qc.invalidateQueries({ queryKey: ['config','theme'] }) });
}
