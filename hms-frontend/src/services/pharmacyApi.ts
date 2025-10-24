import { apiClient } from './apiClient';
import { localDatabaseService, type LocalMedication } from './localDatabase';

// PageResponse interface for pagination
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface ApiEnvelope<T> { 
  status: string; 
  data: T; 
  errors?: any; 
  meta?: any; 
}

export type DosageForm = 
  | 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'DROPS' | 'INHALER' | 'PATCH' | 'SUPPOSITORY'
  | 'POWDER' | 'SOLUTION' | 'SUSPENSION' | 'GEL' | 'LOTION' | 'SPRAY' | 'FOAM' | 'PESSARY' | 'ENEMA'
  | 'INHALATION_POWDER' | 'NEBULIZER_SOLUTION' | 'TRANSDERMAL_PATCH' | 'EYE_DROPS' | 'EAR_DROPS' | 'NASAL_DROPS'
  | 'MOUTHWASH' | 'GARGLES' | 'LOZENGES' | 'CHEWABLE_TABLET' | 'DISPERSIBLE_TABLET' | 'SUSTAINED_RELEASE_TABLET'
  | 'EXTENDED_RELEASE_TABLET' | 'IMMEDIATE_RELEASE_TABLET' | 'DELAYED_RELEASE_TABLET' | 'ENTERIC_COATED_TABLET'
  | 'FILM_COATED_TABLET' | 'OTHER';

export const DOSAGE_FORM_OPTIONS: { value: DosageForm; label: string }[] = [
  { value: 'TABLET', label: 'Tablet' },
  { value: 'CAPSULE', label: 'Capsule' },
  { value: 'SYRUP', label: 'Syrup' },
  { value: 'INJECTION', label: 'Injection' },
  { value: 'CREAM', label: 'Cream' },
  { value: 'OINTMENT', label: 'Ointment' },
  { value: 'DROPS', label: 'Drops' },
  { value: 'INHALER', label: 'Inhaler' },
  { value: 'PATCH', label: 'Patch' },
  { value: 'SUPPOSITORY', label: 'Suppository' },
  { value: 'POWDER', label: 'Powder' },
  { value: 'SOLUTION', label: 'Solution' },
  { value: 'SUSPENSION', label: 'Suspension' },
  { value: 'GEL', label: 'Gel' },
  { value: 'LOTION', label: 'Lotion' },
  { value: 'SPRAY', label: 'Spray' },
  { value: 'FOAM', label: 'Foam' },
  { value: 'PESSARY', label: 'Pessary' },
  { value: 'ENEMA', label: 'Enema' },
  { value: 'INHALATION_POWDER', label: 'Inhalation Powder' },
  { value: 'NEBULIZER_SOLUTION', label: 'Nebulizer Solution' },
  { value: 'TRANSDERMAL_PATCH', label: 'Transdermal Patch' },
  { value: 'EYE_DROPS', label: 'Eye Drops' },
  { value: 'EAR_DROPS', label: 'Ear Drops' },
  { value: 'NASAL_DROPS', label: 'Nasal Drops' },
  { value: 'MOUTHWASH', label: 'Mouthwash' },
  { value: 'GARGLES', label: 'Gargles' },
  { value: 'LOZENGES', label: 'Lozenges' },
  { value: 'CHEWABLE_TABLET', label: 'Chewable Tablet' },
  { value: 'DISPERSIBLE_TABLET', label: 'Dispersible Tablet' },
  { value: 'SUSTAINED_RELEASE_TABLET', label: 'Sustained Release Tablet' },
  { value: 'EXTENDED_RELEASE_TABLET', label: 'Extended Release Tablet' },
  { value: 'IMMEDIATE_RELEASE_TABLET', label: 'Immediate Release Tablet' },
  { value: 'DELAYED_RELEASE_TABLET', label: 'Delayed Release Tablet' },
  { value: 'ENTERIC_COATED_TABLET', label: 'Enteric Coated Tablet' },
  { value: 'FILM_COATED_TABLET', label: 'Film Coated Tablet' },
  { value: 'OTHER', label: 'Other' }
];

export interface Medication {
  id: number;
  medicationCode: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: DosageForm;
  strength?: string;
  unitOfMeasure?: string;
  description?: string;
  unitPrice?: number;
  controlledSubstance: boolean;
  requiresPrescription: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRequest {
  medicationCode: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: DosageForm;
  strength?: string;
  unitOfMeasure?: string;
  description?: string;
  unitPrice?: number;
  controlledSubstance: boolean;
  requiresPrescription: boolean;
  active: boolean;
}

export interface Inventory {
  id: number;
  medicationId: number;
  medicationName: string;
  medicationCode: string;
  quantityInStock: number;
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  lowStock: boolean;
  needsReorder: boolean;
  expired: boolean;
  expiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRequest {
  quantityInStock: number;
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
  location?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: number;
  prescriptionId: number;
  medicationId: number;
  medicationName: string;
  medicationCode: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  dosageInstructions?: string;
  frequency?: string;
  durationDays?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  fullyDispensed: boolean;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  patientId: number;
  patientName: string;
  patientMrn: string;
  prescribedById: number;
  prescribedByName: string;
  prescriptionDate: string;
  status: 'DRAFT' | 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED' | 'EXPIRED' | 'REPLACED' | 'REVERSED';
  notes?: string;
  totalAmount?: number;
  dispensedBy?: number;
  dispensedByName?: string;
  dispensedAt?: string;
  dispensingNotes?: string;
  queueItemId?: number;
  version: number;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItemRequest {
  medicationId: number;
  quantityPrescribed: number;
  dosageInstructions?: string;
  frequency?: string;
  durationDays?: number;
  unitPrice?: number;
  notes?: string;
}

export interface PrescriptionRequest {
  prescriptionNumber: string;
  patientId: number;
  prescribedById: number;
  prescriptionDate: string;
  notes?: string;
  items: PrescriptionItemRequest[];
}

// Medication API
export const medicationApi = {
  getAll: (params?: { active?: boolean; controlled?: boolean; requiresPrescription?: boolean }) =>
    apiClient.get<ApiEnvelope<Medication[]>>('/pharmacy/medications', { params }).then(res => res.data.data),

  getAllPaged: (page: number, size: number, params?: { active?: boolean }) =>
    apiClient.get<ApiEnvelope<any>>(`/pharmacy/medications/page?page=${page}&size=${size}`, { params }).then(res => res.data.data),

  getById: (id: number) =>
    apiClient.get<ApiEnvelope<Medication>>(`/pharmacy/medications/${id}`).then(res => res.data.data),

  getByCode: (code: string) =>
    apiClient.get<ApiEnvelope<Medication>>(`/pharmacy/medications/code/${code}`).then(res => res.data.data),

  search: (query: string) =>
    apiClient.get<ApiEnvelope<Medication[]>>(`/pharmacy/medications/search?q=${encodeURIComponent(query)}`).then(res => res.data.data),

  searchPaged: (query: string, page: number, size: number) =>
    apiClient.get<ApiEnvelope<any>>(`/pharmacy/medications/search/page?q=${encodeURIComponent(query)}&page=${page}&size=${size}`).then(res => res.data.data),

  create: (data: MedicationRequest) =>
    apiClient.post<ApiEnvelope<Medication>>('/pharmacy/medications', data).then(res => res.data.data),

  update: (id: number, data: MedicationRequest) =>
    apiClient.put<ApiEnvelope<Medication>>(`/pharmacy/medications/${id}`, data).then(res => res.data.data),

  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<any>>(`/pharmacy/medications/${id}`).then(res => res.data.data)
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: { 
    lowStock?: boolean; 
    needsReorder?: boolean; 
    expiring?: number; 
    expired?: boolean; 
    supplier?: string; 
    location?: string; 
  }) =>
    apiClient.get<ApiEnvelope<Inventory[]>>('/pharmacy/inventory', { params }).then(res => res.data.data),

  getAllPaged: (page: number, size: number, params?: { lowStock?: boolean; expiring?: number }) =>
    apiClient.get<ApiEnvelope<any>>(`/pharmacy/inventory/page?page=${page}&size=${size}`, { params }).then(res => res.data.data),

  getById: (id: number) =>
    apiClient.get<ApiEnvelope<Inventory>>(`/pharmacy/inventory/${id}`).then(res => res.data.data),

  getByMedicationId: (medicationId: number) =>
    apiClient.get<ApiEnvelope<Inventory>>(`/pharmacy/inventory/medication/${medicationId}`).then(res => res.data.data),

  search: async (query: string) => {
    // Check if we're offline
    if (!navigator.onLine) {
      return await searchInventoryOffline(query);
    }

    try {
      const response = await apiClient.get<ApiEnvelope<Inventory[]>>(`/pharmacy/inventory/search?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      // If API call fails, fall back to offline data
      console.warn('API call failed, falling back to offline data:', error);
      return await searchInventoryOffline(query);
    }
  },

  searchPaged: async (query: string, page: number, size: number) => {
    // Check if we're offline
    if (!navigator.onLine) {
      return await searchInventoryPagedOffline(query, page, size);
    }

    try {
      const response = await apiClient.get<ApiEnvelope<any>>(`/pharmacy/inventory/search/page?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      // If API call fails, fall back to offline data
      console.warn('API call failed, falling back to offline data:', error);
      return await searchInventoryPagedOffline(query, page, size);
    }
  },

  create: (medicationId: number, data: InventoryRequest) =>
    apiClient.post<ApiEnvelope<Inventory>>(`/pharmacy/inventory/medication/${medicationId}`, data).then(res => res.data.data),

  update: (id: number, data: InventoryRequest) =>
    apiClient.put<ApiEnvelope<Inventory>>(`/pharmacy/inventory/${id}`, data).then(res => res.data.data),

  adjustStock: (id: number, quantity: number, notes?: string) =>
    apiClient.post<ApiEnvelope<Inventory>>(`/pharmacy/inventory/${id}/adjust?quantity=${quantity}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`).then(res => res.data.data),

  getSuppliers: () =>
    apiClient.get<ApiEnvelope<string[]>>('/pharmacy/inventory/suppliers').then(res => res.data.data),

  getLocations: () =>
    apiClient.get<ApiEnvelope<string[]>>('/pharmacy/inventory/locations').then(res => res.data.data),

  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<any>>(`/pharmacy/inventory/${id}`).then(res => res.data.data),

  checkStockAvailability: (medicationId: number, quantity: number) =>
    apiClient.get<ApiEnvelope<boolean>>(`/pharmacy/inventory/stock-check/${medicationId}?quantity=${quantity}`).then(res => res.data.data),

          getStockLevel: (medicationId: number) =>
            apiClient.get<ApiEnvelope<number>>(`/pharmacy/inventory/stock-level/${medicationId}`).then(res => res.data.data),

          generateBatchNumber: (medicationId: number) =>
            apiClient.get<ApiEnvelope<string>>(`/pharmacy/inventory/batch-number/generate/${medicationId}`).then(res => res.data.data),

          validateBatchNumber: (batchNumber: string, excludeInventoryId?: number) =>
            apiClient.get<ApiEnvelope<boolean>>(`/pharmacy/inventory/batch-number/validate?batchNumber=${encodeURIComponent(batchNumber)}${excludeInventoryId ? `&excludeInventoryId=${excludeInventoryId}` : ''}`).then(res => res.data.data)
        };

// Prescription API
export const prescriptionApi = {
  getAll: (params?: { patientId?: number; status?: string }) =>
    apiClient.get<ApiEnvelope<Prescription[]>>('/pharmacy/prescriptions', { params }).then(res => res.data.data),

  getAllPaged: (page: number, size: number, params?: { patientId?: number; status?: string }) =>
    apiClient.get<ApiEnvelope<any>>(`/pharmacy/prescriptions/page?page=${page}&size=${size}`, { params }).then(res => res.data.data),

  getById: (id: number) =>
    apiClient.get<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/${id}`).then(res => res.data.data),

  getByNumber: (prescriptionNumber: string) =>
    apiClient.get<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/number/${prescriptionNumber}`).then(res => res.data.data),

  search: (query: string) =>
    apiClient.get<ApiEnvelope<Prescription[]>>(`/pharmacy/prescriptions/search?q=${encodeURIComponent(query)}`).then(res => res.data.data),

  searchPaged: (query: string, page: number, size: number) =>
    apiClient.get<ApiEnvelope<any>>(`/pharmacy/prescriptions/search/page?q=${encodeURIComponent(query)}&page=${page}&size=${size}`).then(res => res.data.data),

  create: (data: PrescriptionRequest) =>
    apiClient.post<ApiEnvelope<Prescription>>('/pharmacy/prescriptions', data).then(res => res.data.data),

  update: (id: number, data: PrescriptionRequest) =>
    apiClient.put<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/${id}`, data).then(res => res.data.data),

  dispense: (id: number, dispensedBy: number, notes?: string) =>
    apiClient.post<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/${id}/dispense?dispensedBy=${dispensedBy}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`).then(res => res.data.data),

  cancel: (id: number) =>
    apiClient.post<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/${id}/cancel`).then(res => res.data.data),

  replace: (id: number, replacementId: number, replacedBy: number, notes?: string) =>
    apiClient.post<ApiEnvelope<Prescription>>(`/pharmacy/prescriptions/${id}/replace?replacementId=${replacementId}&replacedBy=${replacedBy}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`).then(res => res.data.data),

  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<any>>(`/pharmacy/prescriptions/${id}`).then(res => res.data.data)
};

// Queue Prescription API
export const queuePrescriptionApi = {
  getByQueueItem: (queueItemId: number) =>
    apiClient.get<ApiEnvelope<Prescription[]>>(`/pharmacy/queue-prescriptions/queue-item/${queueItemId}`).then(res => res.data.data),

  createForQueueItem: (queueItemId: number, data: any) =>
    apiClient.post<ApiEnvelope<Prescription>>(`/pharmacy/queue-prescriptions/queue-item/${queueItemId}/prescription`, data).then(res => res.data.data)
};

// Offline functions for inventory search
async function searchInventoryOffline(query: string): Promise<Inventory[]> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    // Get all medications
    const medications = await localDatabaseService.getAllMedications();
    
    // Search medications with query
    const filteredMedications = medications.filter(med => 
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    // Convert LocalMedication to Inventory
    return filteredMedications.map(med => ({
      id: med.id,
      medicationId: med.id,
      medicationName: med.name,
      medicationCode: `MED-${med.id}`, // Generate medication code
      description: med.description || '',
      category: '', // Not available in LocalMedication
      currentStock: 0, // Default value for offline
      quantityInStock: 0, // Default value for offline
      minimumStock: 0, // Default value for offline
      minimumStockLevel: 0, // Default value for offline
      maximumStock: 100, // Default value for offline
      unitPrice: 0, // Default value for offline
      supplier: '', // Default value for offline
      location: '', // Default value for offline
      expiryDate: undefined, // Default value for offline
      lastRestocked: null, // Default value for offline
      needsReorder: false, // Default value for offline
      lowStock: false, // Default value for offline
      expired: false, // Default value for offline
      expiringSoon: false, // Default value for offline
      createdAt: med.createdAt,
      updatedAt: med.updatedAt
    }));
  } catch (error) {
    console.error('Offline inventory search failed:', error);
    return [];
  }
}

async function searchInventoryPagedOffline(query: string, page: number, size: number): Promise<PageResponse<Inventory>> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    // Get all medications
    const medications = await localDatabaseService.getAllMedications();
    
    // Search medications with query
    const filteredMedications = medications.filter(med => 
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    // Apply pagination manually
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedMedications = filteredMedications.slice(startIndex, endIndex);
    
    // Convert LocalMedication to Inventory
    const inventories: Inventory[] = paginatedMedications.map(med => ({
      id: med.id,
      medicationId: med.id,
      medicationName: med.name,
      description: med.description || '',
      category: med.category || '',
      currentStock: 0, // Default value for offline
      minimumStock: 0, // Default value for offline
      maximumStock: 100, // Default value for offline
      unitPrice: 0, // Default value for offline
      supplier: '', // Default value for offline
      location: '', // Default value for offline
      expiryDate: undefined, // Default value for offline
      lastRestocked: null, // Default value for offline
      needsReorder: false, // Default value for offline
      lowStock: false, // Default value for offline
      createdAt: med.createdAt,
      updatedAt: med.updatedAt
    }));
    
    return {
      content: inventories,
      totalElements: filteredMedications.length,
      totalPages: Math.ceil(filteredMedications.length / size),
      size: size,
      number: page
    };
  } catch (error) {
    console.error('Offline inventory search failed:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: size,
      number: page
    };
  }
}
