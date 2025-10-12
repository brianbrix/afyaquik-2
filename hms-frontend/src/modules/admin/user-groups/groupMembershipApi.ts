import {apiClient} from '../../../services/apiClient';
import { UserGroup } from './userGroupApi';

export interface StaffUser {
  id: number;
  username: string;
  displayName: string;
  email?: string;
}

export async function fetchGroupMembers(groupId: number): Promise<StaffUser[]> {
  const res = await apiClient.get(`/group-membership/${groupId}/members`);
  return res.data;
}

export async function addGroupMembers(groupId: number, userIds: number[]): Promise<void> {
  await apiClient.post(`/group-membership/${groupId}/members`, userIds);
}

export async function removeGroupMember(groupId: number, userId: number): Promise<void> {
  await apiClient.delete(`/group-membership/${groupId}/members/${userId}`);
}
