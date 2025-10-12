import {apiClient} from '../../../services/apiClient';

export interface UserGroup {
  id?: number;
  name: string;
  description?: string;
}

export async function fetchUserGroups(): Promise<UserGroup[]> {
  const res = await apiClient.get('/user-groups');
  return res.data;
}

export async function createUserGroup(group: Omit<UserGroup, 'id'>): Promise<UserGroup> {
  const res = await apiClient.post('/user-groups', group);
  return res.data;
}

export async function updateUserGroup(id: number, group: Omit<UserGroup, 'id'>): Promise<UserGroup> {
  const res = await apiClient.put(`/user-groups/${id}`, group);
  return res.data;
}

export async function deleteUserGroup(id: number): Promise<void> {
  await apiClient.delete(`/user-groups/${id}`);
}
