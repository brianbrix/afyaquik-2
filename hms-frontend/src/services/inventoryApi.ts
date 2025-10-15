import { apiClient } from './apiClient';
import { ApiEnvelope } from './types';

export interface InventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  departmentId: number;
  departmentName: string;
  unitOfMeasure?: string;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  unitCost: number;
  unitPrice: number;
  barcode?: string;
  isActive: boolean;
  isControlledSubstance: boolean;
  requiresPrescription: boolean;
  storageLocation?: string;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemRequest {
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: number;
  supplierId: number;
  departmentId: number;
  unitOfMeasure?: string;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  unitCost: number;
  unitPrice: number;
  barcode?: string;
  isActive: boolean;
  isControlledSubstance: boolean;
  requiresPrescription: boolean;
  storageLocation?: string;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface ItemCategory {
  id: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCategoryRequest {
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  notes?: string;
}

// Note: Department interface is imported from departmentApi.ts

export const inventoryItemApi = {
  getAll: () =>
    apiClient.get<ApiEnvelope<InventoryItem[]>>('/inventory/items').then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<InventoryItem>>(`/inventory/items/${id}`).then(res => res.data.data),
  
  create: (data: InventoryItemRequest) =>
    apiClient.post<ApiEnvelope<InventoryItem>>('/inventory/items', data).then(res => res.data.data),
  
  update: (id: number, data: InventoryItemRequest) =>
    apiClient.put<ApiEnvelope<InventoryItem>>(`/inventory/items/${id}`, data).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/inventory/items/${id}`).then(res => res.data.data),
  
  getLowStock: () =>
    apiClient.get<ApiEnvelope<InventoryItem[]>>('/inventory/items/low-stock').then(res => res.data.data),
  
  getOverstocked: () =>
    apiClient.get<ApiEnvelope<InventoryItem[]>>('/inventory/items/overstocked').then(res => res.data.data),
  
  search: (searchTerm: string) =>
    apiClient.get<ApiEnvelope<InventoryItem[]>>(`/inventory/items/search?searchTerm=${searchTerm}`).then(res => res.data.data)
};

export const itemCategoryApi = {
  getAll: () =>
    apiClient.get<ApiEnvelope<ItemCategory[]>>('/inventory/categories').then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<ItemCategory>>(`/inventory/categories/${id}`).then(res => res.data.data),
  
  create: (data: ItemCategoryRequest) =>
    apiClient.post<ApiEnvelope<ItemCategory>>('/inventory/categories', data).then(res => res.data.data),
  
  update: (id: number, data: ItemCategoryRequest) =>
    apiClient.put<ApiEnvelope<ItemCategory>>(`/inventory/categories/${id}`, data).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/inventory/categories/${id}`).then(res => res.data.data)
};

export const supplierApi = {
  getAll: () =>
    apiClient.get<ApiEnvelope<Supplier[]>>('/inventory/suppliers').then(res => res.data.data),
  
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<Supplier>>(`/inventory/suppliers/${id}`).then(res => res.data.data),
  
  create: (data: SupplierRequest) =>
    apiClient.post<ApiEnvelope<Supplier>>('/inventory/suppliers', data).then(res => res.data.data),
  
  update: (id: number, data: SupplierRequest) =>
    apiClient.put<ApiEnvelope<Supplier>>(`/inventory/suppliers/${id}`, data).then(res => res.data.data),
  
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/inventory/suppliers/${id}`).then(res => res.data.data)
};

// Note: Department API is available from departmentApi.ts
