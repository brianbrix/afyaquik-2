import { apiClient } from "./apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Patient = {
  id: number;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  dateOfBirth?: string;
  nationalId?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  notes?: string;
};

export type PatientSummary = Patient; // same for now

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
}

export type CreatePatientPayload = {
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string; // ISO date
  nationalId?: string;
  gender?: string;
  visitReason?: string;
  priority?: string;
  // Additional fields
  middleName?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
  notes?: string;
};

const PATIENTS_KEY = (q: string | null) => ["patients", q ?? "all"]; 

export async function searchPatients(query?: string, page: number = 0, size: number = 10): Promise<PageResponse<PatientSummary>> {
  const params: Record<string, string> = {};
  if (query && query.trim()) params.q = query.trim();
  params.page = String(page);
  params.size = String(size);
  const res = await apiClient.get(`/patients`, { params });
  const data = res.data?.data ?? res.data;
  return data as PageResponse<PatientSummary>;
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  const res = await apiClient.post(`/patients`, payload);
  const data = res.data?.data ?? res.data;
  return data as Patient;
}

export async function updatePatient(id: number, payload: CreatePatientPayload): Promise<Patient> {
  const res = await apiClient.put(`/patients/${id}`, payload);
  const data = res.data?.data ?? res.data;
  return data as Patient;
}

export async function deletePatient(id: number): Promise<void> {
  await apiClient.delete(`/patients/${id}`);
}

export function usePatients(query: string, page: number, size: number) {
  return useQuery({
    queryKey: [...PATIENTS_KEY(query), page, size],
    queryFn: () => searchPatients(query, page, size),
  });
}

export function useCreatePatient(currentQuery: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: PATIENTS_KEY(currentQuery) });
      }
  });
}
