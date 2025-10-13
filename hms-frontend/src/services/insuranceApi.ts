
export async function deletePatientInsuranceDetails(patientId: number, detailsId: number): Promise<void> {
  await apiClient.delete(`/patients/insurance-details/${detailsId}`);
}
// src/services/insuranceApi.ts
import { apiClient } from "./apiClient";

export interface InsuranceDetailsDto {
  id?: number;
  patientId?: number;
  providerId?: number;
  planId?: number;
  policyNumber?: string;
  coverageType?: string;
  expiryDate?: string;
  providerName?: string;
  planName?: string;
}


export async function savePatientInsuranceDetails(patientId: number, data: Partial<InsuranceDetailsDto>): Promise<InsuranceDetailsDto> {
  const res = await apiClient.post(`/patients/${patientId}/insurance-details`, data);
  return res.data?.data ?? {};
}

export async function fetchAllPatientInsuranceDetails(patientId: number): Promise<InsuranceDetailsDto[]> {
  const res = await apiClient.get(`/patients/${patientId}/insurance-details`);
  return res.data?.data ?? [];
}
