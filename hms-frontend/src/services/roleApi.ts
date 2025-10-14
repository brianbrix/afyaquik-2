import { apiClient } from "./apiClient";

export type AdminRole = { roleKey: string; displayName: string };
export async function fetchRoles(): Promise<AdminRole[]> {
  const res = await apiClient.get("/admin/roles");
  // Accepts RoleDto: { roleKey, displayName }
  return res.data?.data?.map((r: any) => ({ roleKey: r.roleKey, displayName: r.displayName })) ?? [];
}   
