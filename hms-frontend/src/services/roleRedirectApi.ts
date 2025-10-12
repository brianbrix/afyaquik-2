import { apiClient } from './apiClient';

export interface RoleRedirectUrl {
  id: number;
  tenantId: string;
  roleKey: string;
  redirectUrl: string;
}

export async function fetchRoleRedirects(): Promise<RoleRedirectUrl[]> {
  const res = await apiClient.get<{ data: RoleRedirectUrl[] }>('/config/role-redirects');
  return res.data.data;
}

export async function fetchRoleRedirect(roleKey: string): Promise<RoleRedirectUrl | null> {
  const res = await apiClient.get<{ data: RoleRedirectUrl | null }>(`/config/role-redirects/${encodeURIComponent(roleKey)}`);
  return res.data.data;
}

export async function upsertRoleRedirect(roleKey: string, redirectUrl: string): Promise<RoleRedirectUrl> {
  const res = await apiClient.post<{ data: RoleRedirectUrl }>(`/config/role-redirects`, { roleKey, redirectUrl });
  return res.data.data;
}

export async function deleteRoleRedirect(roleKey: string): Promise<void> {
  await apiClient.delete(`/config/role-redirects/${encodeURIComponent(roleKey)}`);
}
