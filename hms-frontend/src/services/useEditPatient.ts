import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient, CreatePatientPayload } from "./patientApi";
import { updatePatient } from "./patientApi";

export type EditPatientPayload = Partial<CreatePatientPayload> & { id: number };

export async function editPatient(payload: EditPatientPayload): Promise<Patient> {
  const { id, ...rest } = payload;
  return await updatePatient(id, rest as CreatePatientPayload);
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
