import { apiClient } from "./apiClient";

export type BillStatus = 
  | 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export type PaymentMethod = 
  | 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'INSURANCE' | 'CHEQUE' | 'OTHER';

export type PaymentStatus = 
  | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface BillItem {
  id?: number;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  lineTotal: number;
  serviceCategory?: string;
  notes?: string;
}

export interface Payment {
  id?: number;
  paymentNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  processedBy?: string;
  status: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bill {
  id: number;
  billNumber: string;
  patientId: number;
  patientName: string;
  queueItemId?: number;
  status: BillStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  billingDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  items: BillItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillRequest {
  patientId: number;
  patientName: string;
  queueItemId?: number;
  billingDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  items: CreateBillItemRequest[];
}

export interface CreateBillItemRequest {
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  serviceCategory?: string;
  notes?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  processedBy?: string;
}

interface ApiEnvelope<T> { 
  status: string; 
  data: T; 
  errors?: any; 
  meta?: any; 
}

export const billingApi = {
  // Bills
  createBill: (request: CreateBillRequest) =>
    apiClient.post<ApiEnvelope<Bill>>('/billing/bills', request).then(res => res.data.data),

  getBill: (billId: number) =>
    apiClient.get<ApiEnvelope<Bill>>(`/billing/bills/${billId}`).then(res => res.data.data),

  getBillsByPatient: (patientId: number) =>
    apiClient.get<ApiEnvelope<Bill[]>>(`/billing/bills/patient/${patientId}`).then(res => res.data.data),

  getBillsByQueueItem: (queueItemId: number) =>
    apiClient.get<ApiEnvelope<Bill[]>>(`/billing/bills/queue/${queueItemId}`).then(res => res.data.data),

  getAllBills: (params?: { status?: string; patientId?: number }) =>
    apiClient.get<ApiEnvelope<Bill[]>>('/billing/bills', { params }).then(res => res.data.data),

  updateBillStatus: (billId: number, status: BillStatus) =>
    apiClient.patch<ApiEnvelope<Bill>>(`/billing/bills/${billId}/status?status=${status}`).then(res => res.data.data),

  deleteBill: (billId: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/billing/bills/${billId}`).then(res => res.data.data),

  cancelBill: (billId: number) =>
    apiClient.patch<ApiEnvelope<Bill>>(`/billing/bills/${billId}/cancel`).then(res => res.data.data),

  deleteBillItem: (billId: number, itemId: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/billing/bills/${billId}/items/${itemId}`).then(res => res.data.data),

  // Payments
  getPayments: (params?: { method?: string; status?: string }) =>
    apiClient.get<ApiEnvelope<Payment[]>>('/billing/payments', { params }).then(res => res.data.data),

  addPayment: (billId: number, request: CreatePaymentRequest) =>
    apiClient.post<ApiEnvelope<Bill>>(`/billing/bills/${billId}/payments`, request).then(res => res.data.data),

  // Reference data
  getPaymentMethods: () =>
    apiClient.get<ApiEnvelope<any[]>>('/billing/payment-methods').then(res => res.data.data),

  getBillStatuses: () =>
    apiClient.get<ApiEnvelope<string[]>>('/billing/bill-statuses').then(res => res.data.data),
};

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  MOBILE_MONEY: 'Mobile Money',
  INSURANCE: 'Insurance',
  CHEQUE: 'Cheque',
  OTHER: 'Other'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled'
};
