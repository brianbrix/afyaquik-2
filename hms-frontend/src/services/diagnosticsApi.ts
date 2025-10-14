import { apiClient } from './apiClient';

// Types
export interface TestCatalog {
  id: number;
  testCode: string;
  testName: string;
  description?: string;
  testCategoryId: number;
  categoryName: string;
  testType: string;
  cost: number;
  department: string;
  departmentName: string;
  active: boolean;
  instructions?: string;
  preparationInstructions?: string;
  estimatedDurationMinutes: number;
}

export interface TestCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description?: string;
  testType: string;
  active: boolean;
  sortOrder: number;
}

export interface ResultTemplate {
  id: number;
  testCatalogId: number;
  testName: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldOptions?: string;
  required: boolean;
  sortOrder: number;
  validationRules?: string;
  normalRange?: string;
  units?: string;
  active: boolean;
}

export interface DiagnosticOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  patientName: string;
  queueItemId: number;
  ticketNumber: string;
  orderedBy: string;
  orderedByName: string;
  status: string;
  urgency: string;
  clinicalNotes?: string;
  orderedAt: string;
  completedAt?: string;
  diagnosticItems: DiagnosticItem[];
}

export interface DiagnosticItem {
  id: number;
  testCode: string;
  testName: string;
  testType: string;
  department: string;
  status: string;
  cost: number;
}

export interface Sample {
  id: number;
  diagnosticOrderId: number;
  diagnosticItemId: number;
  barcode: string;
  sampleType: string;
  status: string;
  collectedBy: string;
  collectedByName: string;
  collectedAt: string;
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface DiagnosticResult {
  id: number;
  diagnosticOrderId: number;
  diagnosticItemId: number;
  sampleId?: number;
  resultTemplateId?: number;
  fieldName?: string;
  fieldLabel?: string;
  status: string;
  resultValue?: string;
  resultText?: string;
  interpretation?: string;
  comments?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  validatedBy?: string;
  validatedByName?: string;
  validatedAt?: string;
  validationNotes?: string;
}

// API Response wrapper
interface ApiEnvelope<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Test Catalog API
export const testCatalogApi = {
  getAll: (params?: { active?: boolean; testType?: string; department?: string; search?: string }) =>
    apiClient.get<ApiEnvelope<TestCatalog[]>>('/diagnostics/test-catalogs', { params }).then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<TestCatalog>>(`/diagnostics/test-catalogs/${id}`).then(res => res.data.data),
  
  getByCode: (testCode: string) =>
    apiClient.get<ApiEnvelope<TestCatalog>>(`/diagnostics/test-catalogs/code/${testCode}`).then(res => res.data.data),
  
  getDepartments: () =>
    apiClient.get<ApiEnvelope<string[]>>('/diagnostics/test-catalogs/departments').then(res => res.data.data),
  
  create: (catalog: Partial<TestCatalog>) =>
    apiClient.post<ApiEnvelope<TestCatalog>>('/diagnostics/test-catalogs', catalog).then(res => res.data.data),
  
  update: (id: number, catalog: Partial<TestCatalog>) =>
    apiClient.put<ApiEnvelope<TestCatalog>>(`/diagnostics/test-catalogs/${id}`, catalog).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/diagnostics/test-catalogs/${id}`).then(res => res.data.data)
};

// Test Category API
export const testCategoryApi = {
  getAll: (params?: { active?: boolean; testType?: string }) =>
    apiClient.get<ApiEnvelope<TestCategory[]>>('/diagnostics/test-categories', { params }).then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<TestCategory>>(`/diagnostics/test-categories/${id}`).then(res => res.data.data),
  
  getByCode: (categoryCode: string) =>
    apiClient.get<ApiEnvelope<TestCategory>>(`/diagnostics/test-categories/code/${categoryCode}`).then(res => res.data.data),
  
  create: (category: Partial<TestCategory>) =>
    apiClient.post<ApiEnvelope<TestCategory>>('/diagnostics/test-categories', category).then(res => res.data.data),
  
  update: (id: number, category: Partial<TestCategory>) =>
    apiClient.put<ApiEnvelope<TestCategory>>(`/diagnostics/test-categories/${id}`, category).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/diagnostics/test-categories/${id}`).then(res => res.data.data)
};

// Result Template API
export const resultTemplateApi = {
  getAll: (params?: { active?: boolean; testCatalogId?: number }) =>
    apiClient.get<ApiEnvelope<ResultTemplate[]>>('/diagnostics/result-templates', { params }).then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<ResultTemplate>>(`/diagnostics/result-templates/${id}`).then(res => res.data.data),
  
  create: (template: Partial<ResultTemplate>) =>
    apiClient.post<ApiEnvelope<ResultTemplate>>('/diagnostics/result-templates', template).then(res => res.data.data),
  
  update: (id: number, template: Partial<ResultTemplate>) =>
    apiClient.put<ApiEnvelope<ResultTemplate>>(`/diagnostics/result-templates/${id}`, template).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/diagnostics/result-templates/${id}`).then(res => res.data.data)
};

// Sample API
export const sampleApi = {
  getAll: (params?: { diagnosticOrderId?: number; diagnosticItemId?: number; patientId?: number; queueItemId?: number; status?: string }) =>
    apiClient.get<ApiEnvelope<Sample[]>>('/diagnostics/samples', { params }).then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<Sample>>(`/diagnostics/samples/${id}`).then(res => res.data.data),
  
  getByBarcode: (barcode: string) =>
    apiClient.get<ApiEnvelope<Sample>>(`/diagnostics/samples/barcode/${barcode}`).then(res => res.data.data),
  
  create: (sample: Partial<Sample>) =>
    apiClient.post<ApiEnvelope<Sample>>('/diagnostics/samples', sample).then(res => res.data.data),
  
  update: (id: number, sample: Partial<Sample>) =>
    apiClient.put<ApiEnvelope<Sample>>(`/diagnostics/samples/${id}`, sample).then(res => res.data.data),
  
  updateStatus: (id: number, status: string, receivedBy?: string, receivedByName?: string) =>
    apiClient.patch<ApiEnvelope<Sample>>(`/diagnostics/samples/${id}/status`, null, { 
      params: { status, receivedBy, receivedByName } 
    }).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/diagnostics/samples/${id}`).then(res => res.data.data)
};

// Diagnostic Order API
export const diagnosticOrderApi = {
  getAll: () =>
    apiClient.get<ApiEnvelope<DiagnosticOrder[]>>('/diagnostics/orders').then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<DiagnosticOrder>>(`/diagnostics/orders/${id}`).then(res => res.data.data),
  
  getByOrderNumber: (orderNumber: string) =>
    apiClient.get<ApiEnvelope<DiagnosticOrder>>(`/diagnostics/orders/order-number/${orderNumber}`).then(res => res.data.data),
  
  getByPatient: (patientId: number) =>
    apiClient.get<ApiEnvelope<DiagnosticOrder[]>>(`/diagnostics/orders/patient/${patientId}`).then(res => res.data.data),
  
  getByQueueItem: (queueItemId: number) =>
    apiClient.get<ApiEnvelope<DiagnosticOrder[]>>(`/diagnostics/orders/queue-item/${queueItemId}`).then(res => res.data.data),
  
  create: (order: Partial<DiagnosticOrder>) =>
    apiClient.post<ApiEnvelope<DiagnosticOrder>>('/diagnostics/orders', order).then(res => res.data.data),
  
  update: (id: number, order: Partial<DiagnosticOrder>) =>
    apiClient.put<ApiEnvelope<DiagnosticOrder>>(`/diagnostics/orders/${id}`, order).then(res => res.data.data),
  
  updateStatus: (id: number, status: string) =>
    apiClient.patch<ApiEnvelope<DiagnosticOrder>>(`/diagnostics/orders/${id}/status`, null, { 
      params: { status } 
    }).then(res => res.data.data)
};

// Diagnostic Item API
export const diagnosticItemApi = {
  updateStatus: (id: number, status: string) =>
    apiClient.patch<ApiEnvelope<any>>(`/diagnostics/items/${id}/status`, null, { 
      params: { status } 
    }).then(res => res.data.data)
};

// Diagnostic Result API
export const diagnosticResultApi = {
  getAll: (params?: { diagnosticOrderId?: number; diagnosticItemId?: number; patientId?: number; queueItemId?: number; status?: string }) =>
    apiClient.get<ApiEnvelope<DiagnosticResult[]>>('/diagnostics/results', { params }).then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<DiagnosticResult>>(`/diagnostics/results/${id}`).then(res => res.data.data),
  
  create: (result: Partial<DiagnosticResult>) =>
    apiClient.post<ApiEnvelope<DiagnosticResult>>('/diagnostics/results', result).then(res => res.data.data),
  
  update: (id: number, result: Partial<DiagnosticResult>) =>
    apiClient.put<ApiEnvelope<DiagnosticResult>>(`/diagnostics/results/${id}`, result).then(res => res.data.data),
  
  validate: (id: number, validationNotes?: string) =>
    apiClient.patch<ApiEnvelope<DiagnosticResult>>(`/diagnostics/results/${id}/validate`, null, { 
      params: { validationNotes } 
    }).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/diagnostics/results/${id}`).then(res => res.data.data)
};

// Admin API
export const diagnosticsAdminApi = {
  // Test Catalogs
  getTestCatalogs: () =>
    apiClient.get<ApiEnvelope<TestCatalog[]>>('/admin/diagnostics/test-catalogs').then(res => res.data.data),
  
  createTestCatalog: (catalog: Partial<TestCatalog>) =>
    apiClient.post<ApiEnvelope<TestCatalog>>('/admin/diagnostics/test-catalogs', catalog).then(res => res.data.data),
  
  updateTestCatalog: (id: number, catalog: Partial<TestCatalog>) =>
    apiClient.put<ApiEnvelope<TestCatalog>>(`/admin/diagnostics/test-catalogs/${id}`, catalog).then(res => res.data.data),
  
  deleteTestCatalog: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/diagnostics/test-catalogs/${id}`).then(res => res.data.data),
  
  // Test Categories
  getTestCategories: () =>
    apiClient.get<ApiEnvelope<TestCategory[]>>('/admin/diagnostics/test-categories').then(res => res.data.data),
  
  createTestCategory: (category: Partial<TestCategory>) =>
    apiClient.post<ApiEnvelope<TestCategory>>('/admin/diagnostics/test-categories', category).then(res => res.data.data),
  
  updateTestCategory: (id: number, category: Partial<TestCategory>) =>
    apiClient.put<ApiEnvelope<TestCategory>>(`/admin/diagnostics/test-categories/${id}`, category).then(res => res.data.data),
  
  deleteTestCategory: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/diagnostics/test-categories/${id}`).then(res => res.data.data),
  
  // Result Templates
  getResultTemplates: () =>
    apiClient.get<ApiEnvelope<ResultTemplate[]>>('/admin/diagnostics/result-templates').then(res => res.data.data),
  
  createResultTemplate: (template: Partial<ResultTemplate>) =>
    apiClient.post<ApiEnvelope<ResultTemplate>>('/admin/diagnostics/result-templates', template).then(res => res.data.data),
  
  updateResultTemplate: (id: number, template: Partial<ResultTemplate>) =>
    apiClient.put<ApiEnvelope<ResultTemplate>>(`/admin/diagnostics/result-templates/${id}`, template).then(res => res.data.data),
  
  deleteResultTemplate: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/diagnostics/result-templates/${id}`).then(res => res.data.data),
  
  // Dashboard Stats
  getDashboardStats: () =>
    apiClient.get<ApiEnvelope<Record<string, any>>>('/admin/diagnostics/dashboard/stats').then(res => res.data.data)
};
