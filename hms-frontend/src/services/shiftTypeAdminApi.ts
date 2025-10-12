import { apiClient } from "./apiClient";
import type { ShiftType } from "../types/shiftType";

export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const res = await apiClient.get<{ data: ShiftType[] }>("/admin/shift-types");
  return res.data.data;
}

export async function createShiftType(payload: Omit<ShiftType, "id">): Promise<ShiftType> {
  const res = await apiClient.post<{ data: ShiftType }>("/admin/shift-types", payload);
  return res.data.data;
}

export async function updateShiftType(id: number, payload: Partial<Omit<ShiftType, "id">>): Promise<ShiftType> {
  const res = await apiClient.put<{ data: ShiftType }>(`/admin/shift-types/${id}`, payload);
  return res.data.data;
}

export async function deleteShiftType(id: number): Promise<void> {
  await apiClient.delete(`/admin/shift-types/${id}`);
}
