import { apiClient } from "./apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Patient = {
  id: number;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
};

export type PatientSummary = Patient; // same for now

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
};

const PATIENTS_KEY = (q: string | null) => ["patients", q ?? "all"]; 

export async function searchPatients(query?: string): Promise<PatientSummary[]> {
  const params: Record<string, string> = {};
  if (query && query.trim()) params.q = query.trim();
  const res = await apiClient.get(`/patients`, { params });
  // Supports ApiResponse or raw
  const data = res.data?.data ?? res.data;
  return data as PatientSummary[];
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  const res = await apiClient.post(`/patients`, payload);
  const data = res.data?.data ?? res.data;
  return data as Patient;
}

export function usePatients(query: string) {
  return useQuery({
    queryKey: PATIENTS_KEY(query),
    queryFn: () => searchPatients(query),
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
