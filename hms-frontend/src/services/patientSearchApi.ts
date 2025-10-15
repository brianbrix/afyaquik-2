import { apiClient } from './apiClient';

export interface PatientSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  mrn?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const patientSearchApi = {
  searchPatients: async (query: string): Promise<PatientSearchResult[]> => {
    const response = await apiClient.get(`/patients/search?q=${encodeURIComponent(query)}`);
    return response.data?.data ?? response.data;
  }
};
