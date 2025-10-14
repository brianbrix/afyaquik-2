import { apiClient } from "./apiClient";

export interface TriageTitleDto {
  id: number;
  title: string;
}


export async function fetchTriageTitles(): Promise<TriageTitleDto[]> {
  const res = await apiClient.get("/admin/triage-titles");
  return res.data ?? [];
}


// Create a new triage title
export async function createTriageTitle(title: string): Promise<TriageTitleDto> {
  const res = await apiClient.post("/admin/triage-titles", { title });
  return res.data;
}

// Update an existing triage title
export async function updateTriageTitle(id: number, title: string): Promise<TriageTitleDto> {
  const res = await apiClient.put(`/admin/triage-titles/${id}`, { title });
  return res.data;
}

// Delete a triage title
export async function deleteTriageTitle(id: number): Promise<void> {
  await apiClient.delete(`/admin/triage-titles/${id}`);
}
