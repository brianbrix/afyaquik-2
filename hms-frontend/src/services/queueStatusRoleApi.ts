import { apiClient } from "./apiClient";


export async function fetchQueueStatuses(): Promise<string[]> {
  const res = await apiClient.get("/admin/queue-statuses");
  // If backend returns plain array, just return it
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
}


export async function fetchQueueStatusRoleMatrix(): Promise<Record<string, Set<string>>> {
  const res = await apiClient.get("/admin/queue-status-role-matrix");
  // Backend returns: { [roleKey]: [status1, status2, ...] }
  const raw = res.data && typeof res.data === 'object' && !Array.isArray(res.data)
    ? res.data
    : (res.data?.data ?? {});
  const matrix: Record<string, Set<string>> = {};
  Object.entries(raw).forEach(([role, statuses]) => {
    matrix[role] = new Set(statuses as string[]);
  });
  return matrix;
}


export async function updateRoleQueueStatuses(matrix: Record<string, Set<string>>): Promise<void> {
  // Backend expects: { [roleKey]: [status1, status2, ...] }
  const payload: Record<string, string[]> = {};
  Object.entries(matrix).forEach(([role, statuses]) => {
    payload[role] = Array.from(statuses);
  });
  await apiClient.post("/admin/queue-status-role-matrix", payload);
}
