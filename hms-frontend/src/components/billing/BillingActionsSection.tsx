import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { apiClient } from '../../services/apiClient';
import { billingApi } from '../../services/billingApi';
import { useCurrency } from '../../hooks/useCurrency';
import { InvoiceViewer } from './InvoiceViewer';
import { ReceiptViewer } from './ReceiptViewer';
import { PrintableInvoice } from './PrintableInvoice';
import { PrintableReceipt } from './PrintableReceipt';
import Swal from 'sweetalert2';

interface BillingActionsSectionProps {
  queueItemId: number;
  patientId: number;
  patientName?: string;
}

interface Bill {
  id: number;
  billNumber: string;
  patientId: number;
  patientName: string;
  queueItemId: number;
  subtotalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  billingDate: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'PARTIALLY_PAID';
  items: BillItem[];
  payments: Payment[];
  discounts: Discount[];
  createdAt: string;
  updatedAt: string;
}

interface BillItem {
  id: number;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  serviceCategory: string;
  notes?: string;
}

interface Payment {
  id: number;
  paymentNumber?: string;
  amount: number;
  paymentMethod: PaymentMethodInfo;
  paymentDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentMethodInfo {
  id: number;
  name: string;
  code: string;
  description?: string;
  processingFeePercentage: number;
  requiresAuthorization: boolean;
}

interface Discount {
  id: number;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  amount: number;
  appliedBy: string;
  appliedAt: string;
}

interface BillingItem {
  id: number;
  itemCode: string;
  description: string;
  unitPrice: number;
  serviceCategory: string;
  isActive: boolean;
}


export function BillingActionsSection({ queueItemId, patientId, patientName }: BillingActionsSectionProps) {
  const { formatCurrency } = useCurrency();
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentManagementModal, setShowPaymentManagementModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedBillItem, setSelectedBillItem] = useState<BillItem | null>(null);
  const [newBillItem, setNewBillItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'CONSULTATION'
  });
  const [editBillItem, setEditBillItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'CONSULTATION',
    notes: ''
  });
  const [selectedBillingItem, setSelectedBillingItem] = useState<BillingItem | null>(null);
  const [isCustomItem, setIsCustomItem] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentMethodId: 0,
    referenceNumber: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0] // Default to today
  });
  const [newDiscount, setNewDiscount] = useState({
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0
  });

  // Print refs
  const invoicePrintRef = useRef<HTMLDivElement>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Fetch bills for this queue item
  const { data: bills = [], isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ['bills', queueItemId],
    queryFn: async (): Promise<Bill[]> => {
      const res = await apiClient.get(`/billing/bills/queue/${queueItemId}`);
      return res.data?.data ?? res.data;
    }
  });

  // Fetch active payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: async (): Promise<PaymentMethodInfo[]> => {
      const res = await apiClient.get('/billing/payment-methods/active');
      return res.data?.data ?? res.data;
    }
  });

  // Fetch billing items
  const { data: billingItems = [] } = useQuery({
    queryKey: ['billing-items'],
    queryFn: async (): Promise<BillingItem[]> => {
      const res = await apiClient.get('/billing/items');
      return res.data?.data ?? res.data;
    }
  });

  // Fetch billing item categories
  const { data: billingCategories = [] } = useQuery({
    queryKey: ['billing-item-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/billing/item-categories/active');
      return res.data?.data ?? res.data;
    }
  });


  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (data: { patientId: number; patientName: string; queueItemId: number; items: any[] }) => {
      const res = await apiClient.post('/billing/bills', data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setShowCreateBill(false);
      Swal.fire({ icon: 'success', title: 'Bill created', timer: 1500, showConfirmButton: false });
    }
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      await billingApi.deleteBill(billId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      Swal.fire({ icon: 'success', title: 'Bill deleted successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete bill' });
    }
  });

  const cancelBillMutation = useMutation({
    mutationFn: async (billId: number) => {
      await billingApi.cancelBill(billId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      Swal.fire({ icon: 'success', title: 'Bill cancelled successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to cancel bill' });
    }
  });

  const deleteBillItemMutation = useMutation({
    mutationFn: async ({ billId, itemId }: { billId: number; itemId: number }) => {
      await billingApi.deleteBillItem(billId, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      Swal.fire({ icon: 'success', title: 'Bill item deleted successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete bill item' });
    }
  });

  // Update bill item mutation
  const updateBillItemMutation = useMutation({
    mutationFn: async ({ billId, itemId, data }: { billId: number; itemId: number; data: any }) => {
      const res = await apiClient.put(`/billing/bills/${billId}/items/${itemId}`, data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setShowEditItemModal(false);
      setSelectedBillItem(null);
      Swal.fire({ icon: 'success', title: 'Bill item updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update bill item' });
    }
  });

  // Add bill item mutation
  const addBillItemMutation = useMutation({
    mutationFn: async ({ billId, item }: { billId: number; item: any }) => {
      const res = await apiClient.post(`/billing/bills/${billId}/items`, item);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setNewBillItem({ description: '', quantity: 1, unitPrice: 0, category: 'CONSULTATION' });
    }
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ billId, payment }: { billId: number; payment: any }) => {
      const res = await apiClient.post(`/billing/bills/${billId}/payments`, payment);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setShowPaymentModal(false);
      setShowPaymentManagementModal(false);
      setNewPayment({ amount: 0, paymentMethodId: 0, referenceNumber: '', notes: '', paymentDate: new Date().toISOString().split('T')[0] });
      Swal.fire({ icon: 'success', title: 'Payment processed', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to process payment' });
    }
  });

  // Add discount mutation
  const addDiscountMutation = useMutation({
    mutationFn: async ({ billId, discount }: { billId: number; discount: any }) => {
      const res = await apiClient.post(`/billing/bills/${billId}/discounts`, discount);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setShowDiscountModal(false);
      setNewDiscount({ description: '', type: 'PERCENTAGE', value: 0 });
      Swal.fire({ icon: 'success', title: 'Discount applied', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to apply discount' });
    }
  });

  const handleCreateBill = async () => {
    if (!newBillItem.description.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Item description is required' });
      return;
    }
    try {
      // Transform the item to match backend expectations
      const billItemRequest = {
        description: newBillItem.description,
        quantity: newBillItem.quantity,
        unitPrice: newBillItem.unitPrice,
        serviceCategory: newBillItem.category,
        itemCode: selectedBillingItem?.itemCode || '',
        notes: ''
      };
      
      await createBillMutation.mutateAsync({
        patientId,
        patientName: patientName || 'Patient',
        queueItemId,
        items: [billItemRequest]
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create bill' });
    }
  };

  const handleDeleteBill = async (billId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the bill. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteBillMutation.mutateAsync(billId);
      } catch (error: any) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleCancelBill = async (billId: number) => {
    const result = await Swal.fire({
      title: 'Cancel Bill?',
      text: 'This will mark the bill as cancelled. This action can be reversed.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await cancelBillMutation.mutateAsync(billId);
      } catch (error: any) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleDeleteBillItem = async (billId: number, itemId: number) => {
    const result = await Swal.fire({
      title: 'Delete Bill Item?',
      text: 'This will permanently remove this item from the bill.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteBillItemMutation.mutateAsync({ billId, itemId });
      } catch (error: any) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleEditBillItem = (bill: Bill, item: BillItem) => {
    setSelectedBill(bill);
    setSelectedBillItem(item);
    setEditBillItem({
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      category: item.serviceCategory || 'CONSULTATION',
      notes: item.notes || ''
    });
    setShowEditItemModal(true);
  };

  const handleUpdateBillItem = () => {
    if (!selectedBill || !selectedBillItem) return;

    updateBillItemMutation.mutate({
      billId: selectedBill.id,
      itemId: selectedBillItem.id!,
      data: {
        itemCode: selectedBillItem.itemCode || '',
        description: editBillItem.description,
        quantity: editBillItem.quantity,
        unitPrice: editBillItem.unitPrice,
        serviceCategory: editBillItem.category,
        notes: editBillItem.notes
      }
    });
  };

  const handleAddBillItem = async (billId: number) => {
    if (!newBillItem.description.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Description is required' });
      return;
    }
    try {
      // Transform the item to match backend expectations
      const billItemRequest = {
        description: newBillItem.description,
        quantity: newBillItem.quantity,
        unitPrice: newBillItem.unitPrice,
        serviceCategory: newBillItem.category,
        itemCode: selectedBillingItem?.itemCode || '',
        notes: ''
      };
      await addBillItemMutation.mutateAsync({ billId, item: billItemRequest });
      setShowAddItemModal(false);
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to add item' });
    }
  };

  const handleProcessPayment = async (billId: number) => {
    if (!newPayment.amount || !newPayment.paymentMethodId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Amount and payment method are required' });
      return;
    }
    try {
      const paymentData = {
        amount: newPayment.amount,
        paymentMethodId: newPayment.paymentMethodId,
        referenceNumber: newPayment.referenceNumber,
        notes: newPayment.notes,
        paymentDate: new Date(newPayment.paymentDate + 'T00:00:00.000Z').toISOString()
      };
      await processPaymentMutation.mutateAsync({ billId, payment: paymentData });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to process payment' });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const handleViewInvoice = (bill: Bill) => {
    setSelectedBill(bill);
    setShowInvoiceModal(true);
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  // Print handlers
  const handlePrintInvoice = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: selectedBill ? `Invoice-${selectedBill.billNumber}` : 'Invoice',
  });

  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptPrintRef,
    documentTitle: selectedPayment ? `Receipt-${selectedPayment.id}` : 'Receipt',
  });

  if (billsLoading) {
    return <div className="text-center py-3"><Spinner animation="border" size="sm" /> Loading billing...</div>;
  }

  if (billsError) {
    return <Alert variant="danger">Failed to load billing information</Alert>;
  }

  return (
    <div className="billing-actions">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Billing Management</h6>
        <Button 
          size="sm" 
          variant="primary" 
          onClick={() => setShowCreateBill(true)}
          disabled={createBillMutation.isPending}
        >
          {createBillMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Create Bill'}
        </Button>
      </div>

      {bills.length === 0 ? (
        <Alert variant="info" className="mb-0">
          No bills created for this queue item yet.
        </Alert>
      ) : (
        <div className="bills-list">
          {bills.map(bill => (
            <Card key={bill.id} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Bill #{bill.billNumber}</strong>
                  <Badge bg={getStatusVariant(bill.status)} className="ms-2">
                    {bill.status}
                  </Badge>
                </div>
                <div className="text-end">
                  <div className="d-flex flex-column">
                    <strong>Total: {formatCurrency(bill.totalAmount || 0)}</strong>
                    {(bill.balanceDue || 0) > 0 && (
                      <small className="text-danger">Balance: {formatCurrency(bill.balanceDue || 0)}</small>
                    )}
                    {(bill.balanceDue || 0) === 0 && (
                      <small className="text-success">Fully Paid</small>
                    )}
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <Table size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.description || 'No description'}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{formatCurrency(item.unitPrice || 0)}</td>
                        <td>{formatCurrency(item.lineTotal || 0)}</td>
                        <td>{item.serviceCategory || 'No category'}</td>
                        <td>
                          {bill.status !== 'PAID' && item.id && (
                            <div className="d-flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleEditBillItem(bill, item)}
                                disabled={updateBillItemMutation.isPending}
                                title="Edit item"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                onClick={() => handleDeleteBillItem(bill.id, item.id!)}
                                disabled={deleteBillItemMutation.isPending}
                                title="Delete item"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {bill.payments.length > 0 && (
                  <div className="mb-3">
                    <h6>Payments</h6>
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.payments.map(payment => (
                          <tr key={payment.id}>
                            <td>{formatCurrency(payment.amount || 0)}</td>
                            <td>{payment.paymentMethod.name}</td>
                            <td>
                              <Badge bg={payment.status === 'COMPLETED' ? 'success' : 'warning'}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleViewReceipt(payment)}
                              >
                                <i className="bi bi-receipt me-1"></i>
                                Receipt
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                {bill.discounts && Array.isArray(bill.discounts) && bill.discounts.length > 0 && (
                  <div className="mb-3">
                    <h6>Discounts Applied</h6>
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Amount</th>
                          <th>Applied By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.discounts.map(discount => (
                          <tr key={discount.id}>
                            <td>{discount.description}</td>
                            <td>
                              <Badge bg="info">
                                {discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                              </Badge>
                            </td>
                            <td>
                              {discount.type === 'PERCENTAGE' 
                                ? `${discount.value}%` 
                                : formatCurrency(discount.value)
                              }
                            </td>
                            <td className="text-success">
                              -{formatCurrency(discount.amount || 0)}
                            </td>
                            <td>{discount.appliedBy}</td>
                            <td>{new Date(discount.appliedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                  {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedBill(bill);
                        setNewBillItem({ description: '', quantity: 1, unitPrice: 0, category: 'CONSULTATION' });
                        setShowAddItemModal(true);
                      }}
                    >
                      Add Item
                    </Button>
                  )}
                  {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                    <Button 
                      size="sm" 
                      variant="outline-danger"
                      onClick={() => handleDeleteBill(bill.id)}
                      disabled={deleteBillMutation.isPending}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline-info"
                    onClick={() => handleViewInvoice(bill)}
                  >
                    <i className="bi bi-file-text me-1"></i>
                    Invoice
                  </Button>
                  {bill.status !== 'CANCELLED' && (
                    <Button 
                      size="sm" 
                      variant="outline-warning"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowPaymentManagementModal(true);
                      }}
                    >
                      <i className="bi bi-credit-card me-1"></i>
                      Manage Payments
                    </Button>
                  )}
                  {bill.status !== 'PAID' && bill.status !== 'PARTIALLY_PAID' && bill.status !== 'CANCELLED' && (
                    <Button 
                      size="sm" 
                      variant="outline-secondary"
                      onClick={() => handleCancelBill(bill.id)}
                      disabled={cancelBillMutation.isPending}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Cancel Bill
                    </Button>
                  )}
                  {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                    <Button 
                      size="sm" 
                      variant="outline-warning"
                      onClick={() => {
                        setSelectedBill(bill);
                        setNewDiscount({ description: '', type: 'PERCENTAGE', value: 0 });
                        setShowDiscountModal(true);
                      }}
                    >
                      <i className="bi bi-percent me-1"></i>
                      Apply Discount
                    </Button>
                  )}
                  {bill.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => {
                          setSelectedBill(bill);
                          setNewPayment({ amount: bill.balanceDue || bill.totalAmount, paymentMethodId: 0, referenceNumber: '', notes: '', paymentDate: new Date().toISOString().split('T')[0] });
                          setShowPaymentModal(true);
                        }}
                      >
                        Process Payment
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-info"
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowPaymentManagementModal(true);
                        }}
                      >
                        Manage Payments
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Create Bill Modal */}
      <Modal show={showCreateBill} onHide={() => {
        setShowCreateBill(false);
        setSelectedBillingItem(null);
        setIsCustomItem(false);
        setNewBillItem({ description: '', quantity: 1, unitPrice: 0, category: 'CONSULTATION' });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Patient</Form.Label>
            <div className="p-3 bg-light rounded">
              <div className="fw-semibold">{patientName || 'Patient'}</div>
              <small className="text-muted">Patient ID: {patientId}</small>
            </div>
          </Form.Group>

          <div className="mb-3">
            <Form.Check
              type="radio"
              id="select-existing-bill"
              name="billItemType"
              label="Select from existing billing items"
              checked={!isCustomItem}
              onChange={() => setIsCustomItem(false)}
            />
            <Form.Check
              type="radio"
              id="create-custom-bill"
              name="billItemType"
              label="Create custom item"
              checked={isCustomItem}
              onChange={() => setIsCustomItem(true)}
            />
          </div>

          {!isCustomItem ? (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Select Billing Item</Form.Label>
                <Form.Select
                  value={selectedBillingItem?.id || ''}
                  onChange={(e) => {
                    const itemId = Number(e.target.value);
                    const item = billingItems.find(i => i.id === itemId);
                    setSelectedBillingItem(item || null);
                    if (item) {
                      setNewBillItem({
                        ...newBillItem,
                        description: item.description,
                        unitPrice: item.unitPrice,
                        category: item.serviceCategory
                      });
                    }
                  }}
                >
                  <option value="">Select a billing item</option>
                  {billingItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} - {item.description} ({formatCurrency(item.unitPrice)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          ) : (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Item Description *</Form.Label>
                <Form.Control
                  type="text"
                  value={newBillItem.description}
                  onChange={(e) => setNewBillItem({ ...newBillItem, description: e.target.value })}
                  placeholder="Enter item description"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={newBillItem.category}
                  onChange={(e) => setNewBillItem({ ...newBillItem, category: e.target.value })}
                >
                  {billingCategories.map((category: any) => (
                    <option key={category.id} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          )}

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  value={newBillItem.quantity}
                  onChange={(e) => setNewBillItem({ ...newBillItem, quantity: Number(e.target.value) })}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Unit Price *</Form.Label>
                <Form.Control
                  type="number"
                  value={newBillItem.unitPrice}
                  onChange={(e) => setNewBillItem({ ...newBillItem, unitPrice: Number(e.target.value) })}
                  step="0.01"
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Total</Form.Label>
                <Form.Control
                  type="text"
                  value={formatCurrency(newBillItem.quantity * newBillItem.unitPrice)}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCreateBill(false);
            setSelectedBillingItem(null);
            setIsCustomItem(false);
            setNewBillItem({ description: '', quantity: 1, unitPrice: 0, category: 'CONSULTATION' });
          }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateBill} 
            disabled={createBillMutation.isPending}
          >
            {createBillMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Create Bill'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Bill Item Modal */}
      {showAddItemModal && selectedBill && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Item to Bill #{selectedBill.billNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddItemModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    id="select-existing"
                    name="itemType"
                    label="Select from existing billing items"
                    checked={!isCustomItem}
                    onChange={() => setIsCustomItem(false)}
                  />
                  <Form.Check
                    type="radio"
                    id="create-custom"
                    name="itemType"
                    label="Create custom item"
                    checked={isCustomItem}
                    onChange={() => setIsCustomItem(true)}
                  />
                </div>

                {!isCustomItem ? (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Billing Item</Form.Label>
                      <Form.Select
                        value={selectedBillingItem?.id || ''}
                        onChange={(e) => {
                          const itemId = Number(e.target.value);
                          const item = billingItems.find(i => i.id === itemId);
                          setSelectedBillingItem(item || null);
                          if (item) {
                            setNewBillItem({
                              ...newBillItem,
                              description: item.description,
                              unitPrice: item.unitPrice,
                              category: item.serviceCategory
                            });
                          }
                        }}
                      >
                        <option value="">Select a billing item</option>
                        {billingItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.itemCode} - {item.description} ({formatCurrency(item.unitPrice)})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                ) : (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <Form.Control
                        type="text"
                        value={newBillItem.description}
                        onChange={(e) => setNewBillItem({ ...newBillItem, description: e.target.value })}
                        placeholder="Enter item description"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={newBillItem.category}
                        onChange={(e) => setNewBillItem({ ...newBillItem, category: e.target.value })}
                      >
                        {billingCategories.map((category: any) => (
                          <option key={category.id} value={category.categoryName}>
                            {category.categoryName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.quantity}
                        onChange={(e) => setNewBillItem({ ...newBillItem, quantity: Number(e.target.value) })}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit Price *</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.unitPrice}
                        onChange={(e) => setNewBillItem({ ...newBillItem, unitPrice: Number(e.target.value) })}
                        step="0.01"
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatCurrency(newBillItem.quantity * newBillItem.unitPrice)}
                        readOnly
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => handleAddBillItem(selectedBill.id)} disabled={addBillItemMutation.isPending}>
                  {addBillItemMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Add Item'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Process Payment for Bill #{selectedBill.billNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Bill Total: {formatCurrency(selectedBill.totalAmount || 0)}</strong>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    step="0.01"
                    min="0"
                    max={selectedBill.totalAmount}
                  />
                </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      value={newPayment.paymentMethodId}
                      onChange={(e) => setNewPayment({ ...newPayment, paymentMethodId: Number(e.target.value) })}
                    >
                      <option value={0}>Select payment method</option>
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.name} {method.processingFeePercentage > 0 && `(${method.processingFeePercentage}% fee)`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    placeholder="Enter payment notes"
                  />
                </Form.Group>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button variant="success" onClick={() => handleProcessPayment(selectedBill.id)} disabled={processPaymentMutation.isPending}>
                  {processPaymentMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Process Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Discount Modal */}
      {showDiscountModal && selectedBill && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply Discount to Bill #{selectedBill.billNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDiscountModal(false)} />
              </div>
              <div className="modal-body">
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  addDiscountMutation.mutate({
                    billId: selectedBill.id,
                    discount: {
                      description: newDiscount.description,
                      type: newDiscount.type,
                      discountValue: newDiscount.value
                    }
                  });
                }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                      placeholder="e.g., Senior citizen discount"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Discount Type</Form.Label>
                    <Form.Select
                      value={newDiscount.type}
                      onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {newDiscount.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                      min="0"
                      max={newDiscount.type === 'PERCENTAGE' ? 100 : selectedBill.subtotalAmount}
                      step={newDiscount.type === 'PERCENTAGE' ? 1 : 0.01}
                      required
                    />
                    {newDiscount.type === 'PERCENTAGE' && newDiscount.value > 0 && (
                      <small className="text-muted">
                        Discount amount: {formatCurrency((selectedBill.subtotalAmount || 0) * (newDiscount.value || 0) / 100)}
                      </small>
                    )}
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setShowDiscountModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="warning" disabled={addDiscountMutation.isPending}>
                      {addDiscountMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Apply Discount'}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedBill && (
        <InvoiceViewer
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          billId={selectedBill.id}
          patientName={`Patient ${selectedBill.patientId}`}
        />
      )}

      {/* Receipt Modal */}
      {selectedPayment && (
        <ReceiptViewer
          show={showReceiptModal}
          onHide={() => setShowReceiptModal(false)}
          paymentId={selectedPayment.id}
          patientName={`Patient ${selectedBill?.patientId || 'Unknown'}`}
        />
      )}

      {/* Payment Management Modal */}
      {showPaymentManagementModal && selectedBill && (
        <Modal show={showPaymentManagementModal} onHide={() => setShowPaymentManagementModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Payment Management - Bill #{selectedBill.billNumber}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <Row>
                <Col md={6}>
                  <strong>Bill Total: {formatCurrency(selectedBill.totalAmount || 0)}</strong>
                </Col>
                <Col md={6}>
                  <strong>Balance Due: {formatCurrency(selectedBill.balanceDue || 0)}</strong>
                </Col>
              </Row>
            </div>

            {/* Payment History */}
            <h6>Payment History</h6>
            {selectedBill.payments && selectedBill.payments.length > 0 ? (
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatCurrency(payment.amount || 0)}</td>
                      <td>{payment.paymentMethod?.name || 'N/A'}</td>
                      <td>
                        <Badge bg={payment.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>{payment.referenceNumber || 'N/A'}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowReceiptModal(true);
                          }}
                        >
                          <i className="bi bi-receipt"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted">No payments recorded yet.</p>
            )}

            {/* Add New Payment */}
            {selectedBill.status !== 'PAID' && selectedBill.status !== 'CANCELLED' && (
            <div className="mt-4">
              <h6>Add New Payment</h6>
              <Form onSubmit={(e) => {
                e.preventDefault();
                processPaymentMutation.mutate({
                  billId: selectedBill.id,
                  payment: {
                    amount: newPayment.amount,
                    paymentMethodId: newPayment.paymentMethodId,
                    referenceNumber: newPayment.referenceNumber,
                    notes: newPayment.notes,
                    paymentDate: new Date(newPayment.paymentDate + 'T00:00:00.000Z').toISOString()
                  }
                });
              }}>
                <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Payment Amount</Form.Label>
                        <Form.Control
                          type="number"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                          step="0.01"
                          min="0"
                          max={selectedBill.balanceDue || selectedBill.totalAmount}
                          required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Payment Method</Form.Label>
                        <Form.Select
                          value={newPayment.paymentMethodId}
                          onChange={(e) => setNewPayment({ ...newPayment, paymentMethodId: Number(e.target.value) })}
                          required
                        >
                          <option value={0}>Select payment method</option>
                          {paymentMethods.map(method => (
                            <option key={method.id} value={method.id}>
                              {method.name} {method.processingFeePercentage > 0 && `(${method.processingFeePercentage}% fee)`}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row><Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Reference Number (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            value={newPayment.referenceNumber}
                            onChange={(e) => setNewPayment({ ...newPayment, referenceNumber: e.target.value })}
                            placeholder="Enter reference number" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Notes (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            value={newPayment.notes}
                            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                            placeholder="Enter payment notes" />
                        </Form.Group>
                      </Col>
                    </Row>
              
                <div className="d-flex gap-2">
                  <Button type="submit" variant="success" disabled={processPaymentMutation.isPending}>
                    {processPaymentMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Add Payment'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowPaymentManagementModal(false)}>
                    Close
                  </Button>
                </div>
              </Form>
            </div>
            )}
          </Modal.Body>
        </Modal>
      )}

      {/* Invoice Modal with Print */}
      {selectedBill && showInvoiceModal && (
        <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Invoice - {selectedBill.billNumber}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PrintableInvoice ref={invoicePrintRef} bill={selectedBill} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handlePrintInvoice}>
              <i className="bi bi-printer me-2"></i>
              Print Invoice
            </Button>
            <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Receipt Modal with Print */}
      {selectedPayment && selectedBill && showReceiptModal && (
        <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Receipt - {selectedPayment.paymentNumber || `PAY-${selectedPayment.id}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PrintableReceipt ref={receiptPrintRef} payment={selectedPayment} bill={selectedBill} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handlePrintReceipt}>
              <i className="bi bi-printer me-2"></i>
              Print Receipt
            </Button>
            <Button variant="secondary" onClick={() => setShowReceiptModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Bill Item Modal */}
      {showEditItemModal && selectedBill && selectedBillItem && (
        <Modal show={showEditItemModal} onHide={() => setShowEditItemModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Bill Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editBillItem.description}
                      onChange={(e) => setEditBillItem({ ...editBillItem, description: e.target.value })}
                      placeholder="Enter item description"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editBillItem.quantity}
                      onChange={(e) => setEditBillItem({ ...editBillItem, quantity: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter quantity"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit Price *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={editBillItem.unitPrice}
                      onChange={(e) => setEditBillItem({ ...editBillItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter unit price"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service Category</Form.Label>
                    <Form.Select
                      value={editBillItem.category}
                      onChange={(e) => setEditBillItem({ ...editBillItem, category: e.target.value })}
                    >
                      <option value="CONSULTATION">Consultation</option>
                      <option value="PHARMACY">Pharmacy</option>
                      <option value="LABORATORY">Laboratory</option>
                      <option value="RADIOLOGY">Radiology</option>
                      <option value="PROCEDURE">Procedure</option>
                      <option value="OTHER">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total</Form.Label>
                    <Form.Control
                      type="text"
                      value={formatCurrency(editBillItem.quantity * editBillItem.unitPrice)}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editBillItem.notes}
                      onChange={(e) => setEditBillItem({ ...editBillItem, notes: e.target.value })}
                      placeholder="Enter any additional notes"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="primary" 
              onClick={handleUpdateBillItem}
              disabled={updateBillItemMutation.isPending || !editBillItem.description.trim()}
            >
              {updateBillItemMutation.isPending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditItemModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}

    </div>
  );
}
