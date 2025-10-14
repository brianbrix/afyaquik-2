export async function updateConsultationTitle(id: number, title: string): Promise<ConsultationTitleDto> {
  const res = await apiClient.put(`/admin/consultation-titles/${id}`, { id, title });
  return res.data?.data;
}
import { apiClient } from "./apiClient";

export interface ConsultationTitleDto {
  id: number;
  title: string;
}

export async function fetchConsultationTitles(): Promise<ConsultationTitleDto[]> {
  const res = await apiClient.get("/admin/consultation-titles");
  return res.data?.data ?? [];
}

export async function createConsultationTitle(title: string): Promise<ConsultationTitleDto> {
  const res = await apiClient.post("/admin/consultation-titles", { title });
  return res.data?.data;
}

export async function deleteConsultationTitle(id: number): Promise<void> {
  await apiClient.delete(`/admin/consultation-titles/${id}`);
}
