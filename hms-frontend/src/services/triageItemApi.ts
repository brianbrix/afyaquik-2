import { apiClient } from './apiClient';

export interface TriageItem {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  dataType: 'NUMERIC' | 'TEXT' | 'BOOLEAN' | 'SELECT';
  required: boolean;
  displayOrder: number;
  active: boolean;
  
  // Normal range
  normalMinValue?: number;
  normalMaxValue?: number;
  normalTextValues?: string[];
  
  // Abnormal range
  abnormalMinValue?: number;
  abnormalMaxValue?: number;
  
  // Calculation
  calculationFormula?: string;
  calculationNotes?: string;
  variableMappings?: string;
  
  // Input configuration
  inputPlaceholder?: string;
  inputValidation?: string;
  selectOptions?: string[];
  
  // Display
  displayFormat?: string;
  helpText?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  
  // Thresholds
  warningThresholdMin?: number;
  warningThresholdMax?: number;
  criticalThresholdMin?: number;
  criticalThresholdMax?: number;
  
  // Input configuration
  inputConfig?: string;
  
  // Metadata
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TriageItemRequest {
  name: string;
  description: string;
  category: string;
  unit: string;
  dataType: 'NUMERIC' | 'TEXT' | 'BOOLEAN' | 'SELECT';
  required: boolean;
  displayOrder: number;
  active: boolean;
  
  // Normal range
  normalMinValue?: number;
  normalMaxValue?: number;
  normalTextValues?: string[];
  
  // Abnormal range
  abnormalMinValue?: number;
  abnormalMaxValue?: number;
  
  // Calculation
  calculationFormula?: string;
  calculationNotes?: string;
  variableMappings?: string;
  
  // Input configuration
  inputPlaceholder?: string;
  inputValidation?: string;
  selectOptions?: string[];
  
  // Display
  displayFormat?: string;
  helpText?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  
  // Thresholds
  warningThresholdMin?: number;
  warningThresholdMax?: number;
  criticalThresholdMin?: number;
  criticalThresholdMax?: number;
  
  // Input configuration
  inputConfig?: string;
}

export interface TriageEntry {
  id: number;
  patientId: number;
  patientName: string;
  patientMrn: string;
  triageItemId: number;
  triageItemName: string;
  triageItemCategory: string;
  triageItemUnit: string;
  staffId: number;
  staffName: string;
  
  // Values
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  selectValue?: string;
  displayValue: string;
  
  // Calculations
  calculatedValue?: number;
  calculationResult?: string;
  
  // Assessment
  isNormal?: boolean;
  isAbnormal?: boolean;
  isWarning?: boolean;
  isCritical?: boolean;
  statusColor: string;
  statusText: string;
  
  // Notes
  assessmentNotes?: string;
  staffNotes?: string;
  nurseNotes?: string;
  colorCodedNotes?: string;
  medicalConditions?: string;
  
  // Metadata
  triageTimestamp: string;
  queueItemId?: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TriageEntryRequest {
  patientId: number;
  triageItemId: number;
  staffId: number;
  
  // Values (only one should be provided based on triage item data type)
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  selectValue?: string;
  
  // Notes
  assessmentNotes?: string;
  staffNotes?: string;
  
  // Optional timestamp (defaults to now)
  triageTimestamp?: string;
  
  // Optional queue item reference
  queueItemId?: number;
}

// Triage Item API
export const triageItemApi = {
  // Get all triage items
  getAllTriageItems: async (): Promise<TriageItem[]> => {
    const response = await apiClient.get('/triage-items');
    return response.data.data;
  },

  // Get active triage items
  getActiveTriageItems: async (): Promise<TriageItem[]> => {
    const response = await apiClient.get('/triage-items');
    return response.data.data;
  },

  // Get triage items by category
  getTriageItemsByCategory: async (category: string): Promise<TriageItem[]> => {
    const response = await apiClient.get(`/triage-items/category/${category}`);
    return response.data.data;
  },

  // Get triage item by ID
  getTriageItemById: async (id: number): Promise<TriageItem> => {
    const response = await apiClient.get(`/triage-items/${id}`);
    return response.data.data;
  },

  // Create new triage item
  createTriageItem: async (request: TriageItemRequest): Promise<TriageItem> => {
    const response = await apiClient.post('/triage-items', request);
    return response.data.data;
  },

  // Update triage item
  updateTriageItem: async (id: number, request: TriageItemRequest): Promise<TriageItem> => {
    const response = await apiClient.put(`/triage-items/${id}`, request);
    return response.data.data;
  },

  // Delete triage item
  deleteTriageItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/triage-items/${id}`);
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/triage-items/categories');
    return response.data.data;
  },

  // Get all data types
  getDataTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/triage-items/data-types');
    return response.data.data;
  }
};

// Triage Entry API
export const triageEntryApi = {
  // Create new triage entry
  createTriageEntry: async (request: TriageEntryRequest): Promise<TriageEntry> => {
    const response = await apiClient.post('/triage-assessments', request);
    return response.data.data;
  },

  // Update existing triage entry
  updateTriageEntry: async (id: number, request: TriageEntryRequest): Promise<TriageEntry> => {
    const response = await apiClient.put(`/triage-assessments/${id}`, request);
    return response.data.data;
  },

  // Get triage entries for a patient
  getTriageEntriesForPatient: async (patientId: number): Promise<TriageEntry[]> => {
    const response = await apiClient.get(`/triage-assessments/patient/${patientId}`);
    return response.data.data;
  },

  // Get triage entries by triage item
  getTriageEntriesByItem: async (triageItemId: number): Promise<TriageEntry[]> => {
    const response = await apiClient.get(`/triage-assessments/triage-item/${triageItemId}`);
    return response.data.data;
  },

  // Get entries needing review
  getEntriesNeedingReview: async (): Promise<TriageEntry[]> => {
    const response = await apiClient.get('/triage-assessments/needing-review');
    return response.data.data;
  },

  // Get calculation summary for a patient
  getCalculationSummary: async (patientId: number): Promise<any> => {
    const response = await apiClient.get(`/triage-assessments/patient/${patientId}/calculation-summary`);
    return response.data.data;
  },

  // Recalculate entries for a patient
  recalculatePatientEntries: async (patientId: number): Promise<void> => {
    await apiClient.post(`/triage-assessments/patient/${patientId}/recalculate`);
  }
};
