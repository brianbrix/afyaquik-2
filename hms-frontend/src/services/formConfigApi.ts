import { apiClient, ApiEnvelope } from './apiClient';

export interface FormFieldConfig {
  id?: number;
  tenantId?: string;
  formType: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  section: string;
  isEnabled: boolean;
  isRequired: boolean;
  displayOrder: number;
  validationRules?: string;
  fieldOptions?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export const formConfigApi = {
  // Get enabled fields for a form type
  getEnabledFields: (formType: string): Promise<FormFieldConfig[]> => {
    return apiClient.get<ApiEnvelope<FormFieldConfig[]>>(`/forms/${formType}/fields`).then(res => res.data.data);
  },

  // Get all field configurations for a form type (admin only)
  getAllFields: (formType: string): Promise<FormFieldConfig[]> => {
    return apiClient.get<ApiEnvelope<FormFieldConfig[]>>(`/forms/${formType}/config`).then(res => res.data.data);
  },

  // Update field configurations for a form type (admin only)
  updateFieldConfigurations: (formType: string, configurations: FormFieldConfig[]): Promise<FormFieldConfig[]> => {
    return apiClient.put<ApiEnvelope<FormFieldConfig[]>>(`/forms/${formType}/config`, configurations).then(res => res.data.data);
  },

  // Initialize default patient form configuration (admin only)
  initializeDefaultPatientForm: (): Promise<string> => {
    return apiClient.post<ApiEnvelope<string>>('/forms/patient/init-default').then(res => res.data.data);
  },

  // Force reinitialize default patient form configuration (admin only)
  forceReinitializeDefaultPatientForm: (): Promise<string> => {
    return apiClient.post<ApiEnvelope<string>>('/forms/patient/force-reinit').then(res => res.data.data);
  }
};
