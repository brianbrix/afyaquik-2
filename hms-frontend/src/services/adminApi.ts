import { apiClient } from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ---- Types ----
// All role keys/types are dynamic from backend
export interface AdminRole { id: number; roleKey: string; displayName: string; }
export interface AdminDepartment { id: number; departmentId: string; displayName: string; description?: string; }
export interface AdminUser { 
  id: number; 
  username: string; 
  displayName: string; 
  email?: string; 
  enabled: boolean; 
  roles: AdminRole[];
  supervisorId?: number;
  supervisorDisplayName?: string;
}

interface ApiEnvelope<T> { status: string; data: T; errors?: any; meta?: any; }

// ---- API functions ----
export async function fetchRoles(): Promise<AdminRole[]> {
  const res = await apiClient.get<ApiEnvelope<AdminRole[]>>('/admin/roles');
  return res.data.data;
}
export async function createRole(payload: { roleKey: string; displayName: string; }): Promise<AdminRole> {
  const res = await apiClient.post<ApiEnvelope<AdminRole>>('/admin/roles', payload);
  return res.data.data;
}
export async function updateRole(id: number, payload: { displayName: string; }): Promise<AdminRole> {
  const res = await apiClient.put<ApiEnvelope<AdminRole>>(`/admin/roles/${id}`, payload);
  return res.data.data;
}
export async function deleteRole(id: number): Promise<void> {
  await apiClient.delete<ApiEnvelope<void>>(`/admin/roles/${id}`);
}

export async function fetchDepartments(): Promise<AdminDepartment[]> {
  const res = await apiClient.get<ApiEnvelope<AdminDepartment[]>>('/reference/departments');
  return res.data.data;
}
export async function createDepartment(payload: { departmentId: string; displayName: string; description?: string; }): Promise<AdminDepartment> {
  const res = await apiClient.post<ApiEnvelope<AdminDepartment>>('/admin/departments', payload);
  return res.data.data;
}
export async function updateDepartment(id: number, payload: { displayName: string; description?: string; }): Promise<AdminDepartment> {
  const res = await apiClient.put<ApiEnvelope<AdminDepartment>>(`/admin/departments/${id}`, payload);
  return res.data.data;
}
export async function deleteDepartment(id: number): Promise<void> {
  await apiClient.delete<ApiEnvelope<void>>(`/admin/departments/${id}`);
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await apiClient.get<ApiEnvelope<AdminUser[]>>('/admin/users');
  return res.data.data;
}
export async function createUser(payload: { username: string; displayName: string; email?: string; password: string; roleKeys?: string[]; }): Promise<AdminUser> {
  const res = await apiClient.post<ApiEnvelope<AdminUser>>('/admin/users', payload);
  return res.data.data;
}

export async function updateUser(id: number, payload: { 
  displayName: string; 
  email?: string; 
  enabled: boolean;
  supervisorId?: number | null;
  supervisorDisplayName?: string | null;
}): Promise<AdminUser> {
  const res = await apiClient.put<ApiEnvelope<AdminUser>>(`/admin/users/${id}` , payload);
  return res.data.data;
}

export async function updateUserRoles(id: number, roleKeys: string[]): Promise<AdminUser> {
  const res = await apiClient.patch<ApiEnvelope<AdminUser>>(`/admin/users/${id}/roles`, { roleKeys });
  return res.data.data;
}
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete<ApiEnvelope<void>>(`/admin/users/${id}`);
}

// ---- Hooks ----
export function useAdminRoles() {
  return useQuery({ queryKey: ['admin','roles'], queryFn: fetchRoles });
}
export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createRole, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','roles'] }) });
}
export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (vars: { id: number; displayName: string; }) => updateRole(vars.id, { displayName: vars.displayName }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['admin','roles'] });
      const prev = qc.getQueryData<AdminRole[]>(['admin','roles']);
      if (prev) {
        qc.setQueryData<AdminRole[]>(['admin','roles'], prev.map(r => r.id === vars.id ? { ...r, displayName: vars.displayName } : r));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(['admin','roles'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin','roles'] })
  });
}
export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteRole(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','roles'] }) });
}

export function useAdminDepartments() {
  return useQuery({ queryKey: ['admin','departments'], queryFn: fetchDepartments });
}
export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createDepartment, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','departments'] }) });
}
export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (vars: { id: number; displayName: string; description?: string; }) => updateDepartment(vars.id, { displayName: vars.displayName, description: vars.description }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['admin','departments'] });
      const prev = qc.getQueryData<AdminDepartment[]>(['admin','departments']);
      if (prev) {
        qc.setQueryData<AdminDepartment[]>(['admin','departments'], prev.map(d => d.id === vars.id ? { ...d, displayName: vars.displayName, description: vars.description } : d));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(['admin','departments'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin','departments'] })
  });
}
export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteDepartment(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','departments'] }) });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ['admin','users'], queryFn: fetchUsers });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createUser, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','users'] }) });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (vars: { 
      id: number; 
      displayName: string; 
      email?: string; 
      enabled: boolean;
      supervisorId?: number | null;
      supervisorDisplayName?: string | null;
    }) => updateUser(vars.id, { 
      displayName: vars.displayName, 
      email: vars.email, 
      enabled: vars.enabled,
      supervisorId: vars.supervisorId,
      supervisorDisplayName: vars.supervisorDisplayName
    }), 
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','users'] }) 
  });
}

export function useUpdateUserRoles() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: number; roleKeys: string[] }) => updateUserRoles(vars.id, vars.roleKeys), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','users'] }) });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','users'] }) });
}
