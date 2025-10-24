import { apiClient } from "./apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { localDatabaseService, type LocalPatient } from "./localDatabase";

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
  // Check if we're offline
  if (!navigator.onLine) {
    return await searchPatientsOffline(query, page, size);
  }

  try {
    const params: Record<string, string> = {};
    if (query && query.trim()) params.q = query.trim();
    params.page = String(page);
    params.size = String(size);
    const res = await apiClient.get(`/patients`, { params });
    const data = res.data?.data ?? res.data;
    return data as PageResponse<PatientSummary>;
  } catch (error) {
    // If API call fails, fall back to offline data
    console.warn('API call failed, falling back to offline data:', error);
    return await searchPatientsOffline(query, page, size);
  }
}

async function searchPatientsOffline(query?: string, page: number = 0, size: number = 10): Promise<PageResponse<PatientSummary>> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    let patients: PatientSummary[];
    
    if (query && query.trim()) {
      // Search patients with query
      patients = await localDatabaseService.searchPatients(query.trim());
    } else {
      // Get all patients
      patients = await localDatabaseService.getAllPatients();
    }
    
    // Apply pagination manually
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedPatients = patients.slice(startIndex, endIndex);
    
    return {
      content: paginatedPatients,
      totalElements: patients.length,
      totalPages: Math.ceil(patients.length / size),
      size: size,
      number: page
    };
  } catch (error) {
    console.error('Offline patient search failed:', error);
    // Return empty result if offline search fails
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: size,
      number: page
    };
  }
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  // Check if we're offline
  if (!navigator.onLine) {
    return await createPatientOffline(payload);
  }

  try {
    const res = await apiClient.post(`/patients`, payload);
    const data = res.data?.data ?? res.data;
    return data as Patient;
  } catch (error) {
    // If API call fails, save offline
    console.warn('API call failed, saving offline:', error);
    return await createPatientOffline(payload);
  }
}

async function createPatientOffline(payload: CreatePatientPayload): Promise<Patient> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    // Generate a temporary ID for offline use
    const tempId = Date.now(); // Use timestamp as temporary ID
    
    const localPatient: LocalPatient = {
      id: tempId,
      medicalRecordNumber: payload.medicalRecordNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      middleName: payload.middleName,
      phone: payload.phone,
      alternatePhone: payload.alternatePhone,
      email: payload.email,
      dateOfBirth: payload.dateOfBirth,
      nationalId: payload.nationalId,
      gender: payload.gender,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactPhone: payload.emergencyContactPhone,
      emergencyContactRelationship: payload.emergencyContactRelationship,
      allergies: payload.allergies,
      medications: payload.medications,
      medicalHistory: payload.medicalHistory,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to local database
    await localDatabaseService.savePatients([localPatient]);
    
    // Return the created patient
    return localPatient as Patient;
  } catch (error) {
    console.error('Offline patient creation failed:', error);
    throw new Error('Failed to create patient offline');
  }
}

export async function updatePatient(id: number, payload: CreatePatientPayload): Promise<Patient> {
  // Check if we're offline
  if (!navigator.onLine) {
    return await updatePatientOffline(id, payload);
  }

  try {
    const res = await apiClient.put(`/patients/${id}`, payload);
    const data = res.data?.data ?? res.data;
    return data as Patient;
  } catch (error) {
    // If API call fails, save offline
    console.warn('API call failed, saving offline:', error);
    return await updatePatientOffline(id, payload);
  }
}

async function updatePatientOffline(id: number, payload: CreatePatientPayload): Promise<Patient> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    // Get existing patient from local database
    const existingPatients = await localDatabaseService.getAllPatients();
    const existingPatient = existingPatients.find(p => p.id === id);
    
    if (!existingPatient) {
      throw new Error('Patient not found in local database');
    }
    
    // Update the patient
    const updatedPatient: LocalPatient = {
      ...existingPatient,
      medicalRecordNumber: payload.medicalRecordNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      middleName: payload.middleName,
      phone: payload.phone,
      alternatePhone: payload.alternatePhone,
      email: payload.email,
      dateOfBirth: payload.dateOfBirth,
      nationalId: payload.nationalId,
      gender: payload.gender,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactPhone: payload.emergencyContactPhone,
      emergencyContactRelationship: payload.emergencyContactRelationship,
      allergies: payload.allergies,
      medications: payload.medications,
      medicalHistory: payload.medicalHistory,
      notes: payload.notes,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated patient to local database
    await localDatabaseService.savePatients([updatedPatient]);
    
    // Return the updated patient
    return updatedPatient as Patient;
  } catch (error) {
    console.error('Offline patient update failed:', error);
    throw new Error('Failed to update patient offline');
  }
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
