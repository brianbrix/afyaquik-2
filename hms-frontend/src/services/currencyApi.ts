import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface Currency {
  id?: number;
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  decimalPlaces: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  decimalPlaces: number;
  isActive: boolean;
}

export const currencyApi = {
  // Get all active currencies
  getActiveCurrencies: () =>
    apiClient.get<ApiEnvelope<Currency[]>>('/admin/currencies/active').then(res => res.data.data),

  // Get all currencies (including inactive)
  getAllCurrencies: () =>
    apiClient.get<ApiEnvelope<Currency[]>>('/admin/currencies').then(res => res.data.data),

  // Get default currency
  getDefaultCurrency: () =>
    apiClient.get<ApiEnvelope<Currency>>('/admin/currencies/default').then(res => res.data.data),

  // Get currency by ID
  getCurrencyById: (id: number) =>
    apiClient.get<ApiEnvelope<Currency>>(`/admin/currencies/${id}`).then(res => res.data.data),

  // Create currency
  createCurrency: (currency: CurrencyRequest) =>
    apiClient.post<ApiEnvelope<Currency>>('/admin/currencies', currency).then(res => res.data.data),

  // Update currency
  updateCurrency: (id: number, currency: CurrencyRequest) =>
    apiClient.put<ApiEnvelope<Currency>>(`/admin/currencies/${id}`, currency).then(res => res.data.data),

  // Delete currency
  deleteCurrency: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/currencies/${id}`).then(res => res.data.data),

  // Set currency as default
  setDefaultCurrency: (id: number) =>
    apiClient.post<ApiEnvelope<Currency>>(`/admin/currencies/${id}/set-default`).then(res => res.data.data)
};
