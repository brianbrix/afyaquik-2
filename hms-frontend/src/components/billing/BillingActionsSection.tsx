import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import { InvoiceViewer } from './InvoiceViewer';
import { ReceiptViewer } from './ReceiptViewer';
import Swal from 'sweetalert2';

interface BillingActionsSectionProps {
  queueItemId: number;
  patientId: number;
}

interface Bill {
  id: number;
  billNumber: string;
  patientId: number;
  queueItemId: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'PARTIALLY_PAID';
  items: BillItem[];
  payments: Payment[];
  discounts: Discount[];
  createdAt: string;
  updatedAt: string;
}

interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface Payment {
  id: number;
  amount: number;
  paymentMethod: PaymentMethodInfo;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
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


export function BillingActionsSection({ queueItemId, patientId }: BillingActionsSectionProps) {
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newBillItem, setNewBillItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'CONSULTATION'
  });
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentMethodId: 0,
    referenceNumber: '',
    notes: ''
  });
  const [newDiscount, setNewDiscount] = useState({
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0
  });

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


  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (data: { patientId: number; queueItemId: number; items: any[] }) => {
      const res = await apiClient.post('/billing/bills', data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', queueItemId] });
      setShowCreateBill(false);
      Swal.fire({ icon: 'success', title: 'Bill created', timer: 1500, showConfirmButton: false });
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
      setNewPayment({ amount: 0, paymentMethodId: 0, referenceNumber: '', notes: '' });
      Swal.fire({ icon: 'success', title: 'Payment processed', timer: 1500, showConfirmButton: false });
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
    }
  });

  const handleCreateBill = async () => {
    try {
      await createBillMutation.mutateAsync({
        patientId,
        queueItemId,
        items: [newBillItem]
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create bill' });
    }
  };

  const handleAddBillItem = async (billId: number) => {
    if (!newBillItem.description.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Description is required' });
      return;
    }
    try {
      await addBillItemMutation.mutateAsync({ billId, item: newBillItem });
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
        notes: newPayment.notes
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
                    <strong>Total: ${bill.totalAmount.toFixed(2)}</strong>
                    {bill.balanceAmount > 0 && (
                      <small className="text-danger">Balance: ${bill.balanceAmount.toFixed(2)}</small>
                    )}
                    {bill.balanceAmount === 0 && (
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
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td>${item.totalPrice.toFixed(2)}</td>
                        <td>{item.category}</td>
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
                            <td>${payment.amount.toFixed(2)}</td>
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

                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      setSelectedBill(bill);
                      setNewBillItem({ description: '', quantity: 1, unitPrice: 0, category: 'CONSULTATION' });
                    }}
                  >
                    Add Item
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-info"
                    onClick={() => handleViewInvoice(bill)}
                  >
                    <i className="bi bi-file-text me-1"></i>
                    Invoice
                  </Button>
                  {bill.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => {
                          setSelectedBill(bill);
                          setNewPayment({ amount: bill.balanceAmount || bill.totalAmount, paymentMethodId: 0, referenceNumber: '', notes: '' });
                          setShowPaymentModal(true);
                        }}
                      >
                        Process Payment
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => {
                          setSelectedBill(bill);
                          setNewDiscount({ description: '', type: 'PERCENTAGE', value: 0 });
                          setShowDiscountModal(true);
                        }}
                      >
                        Apply Discount
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
      {showCreateBill && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Bill</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateBill(false)} />
              </div>
              <div className="modal-body">
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={newBillItem.description}
                    onChange={(e) => setNewBillItem({ ...newBillItem, description: e.target.value })}
                    placeholder="Enter item description"
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.quantity}
                        onChange={(e) => setNewBillItem({ ...newBillItem, quantity: Number(e.target.value) })}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit Price</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.unitPrice}
                        onChange={(e) => setNewBillItem({ ...newBillItem, unitPrice: Number(e.target.value) })}
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={newBillItem.category}
                        onChange={(e) => setNewBillItem({ ...newBillItem, category: e.target.value })}
                      >
                        <option value="CONSULTATION">Consultation</option>
                        <option value="DIAGNOSTICS">Diagnostics</option>
                        <option value="PHARMACY">Pharmacy</option>
                        <option value="PROCEDURE">Procedure</option>
                        <option value="OTHER">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowCreateBill(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreateBill} disabled={createBillMutation.isPending}>
                  {createBillMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Create Bill'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Item Modal */}
      {selectedBill && !showPaymentModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Item to Bill #{selectedBill.billNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBill(null)} />
              </div>
              <div className="modal-body">
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={newBillItem.description}
                    onChange={(e) => setNewBillItem({ ...newBillItem, description: e.target.value })}
                    placeholder="Enter item description"
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.quantity}
                        onChange={(e) => setNewBillItem({ ...newBillItem, quantity: Number(e.target.value) })}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit Price</Form.Label>
                      <Form.Control
                        type="number"
                        value={newBillItem.unitPrice}
                        onChange={(e) => setNewBillItem({ ...newBillItem, unitPrice: Number(e.target.value) })}
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={newBillItem.category}
                        onChange={(e) => setNewBillItem({ ...newBillItem, category: e.target.value })}
                      >
                        <option value="CONSULTATION">Consultation</option>
                        <option value="DIAGNOSTICS">Diagnostics</option>
                        <option value="PHARMACY">Pharmacy</option>
                        <option value="PROCEDURE">Procedure</option>
                        <option value="OTHER">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setSelectedBill(null)}>Cancel</Button>
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
                  <strong>Bill Total: ${selectedBill.totalAmount.toFixed(2)}</strong>
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
                    discount: newDiscount
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
                        Discount amount: ${(selectedBill.subtotalAmount * newDiscount.value / 100).toFixed(2)}
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
    </div>
  );
}
