import { apiClient } from "./apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient, CreatePatientPayload } from "./patientApi";

export type EditPatientPayload = Partial<CreatePatientPayload> & { id: number };

export async function editPatient(payload: EditPatientPayload): Promise<Patient> {
  const { id, ...rest } = payload;
  const res = await apiClient.put(`/api/v1/patients/${id}`, rest);
  return res.data?.data ?? res.data;
}

export function useEditPatient(currentQuery: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: editPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients", currentQuery] });
    }
  });
}
