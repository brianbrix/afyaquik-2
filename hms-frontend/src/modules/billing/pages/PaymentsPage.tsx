import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, InputGroup, Alert, Spinner, Modal } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, Payment, PaymentMethod, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../../services/billingApi';
import Swal from 'sweetalert2';

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);

  // Mock payments data - in real implementation, this would come from API
  const mockPayments: Payment[] = [
    {
      id: 1,
      paymentNumber: 'PAY-001',
      amount: 5000,
      paymentMethod: 'CASH',
      paymentDate: '2024-01-15T10:30:00Z',
      referenceNumber: 'REF001',
      notes: 'Full payment received',
      processedBy: 'John Doe',
      status: 'COMPLETED',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      paymentNumber: 'PAY-002',
      amount: 2500,
      paymentMethod: 'CARD',
      paymentDate: '2024-01-16T14:20:00Z',
      referenceNumber: 'TXN123456',
      notes: 'Partial payment',
      processedBy: 'Jane Smith',
      status: 'COMPLETED',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    }
  ];

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', methodFilter],
    queryFn: async () => {
      try {
        return await billingApi.getPayments({ method: methodFilter });
      } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
      }
    }
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.processedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = !methodFilter || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      case 'REFUNDED': return 'info';
      case 'CANCELLED': return 'dark';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const paymentData = {
      amount: parseFloat(formData.get('amount') as string),
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      paymentDate: new Date().toISOString(),
      referenceNumber: formData.get('referenceNumber') as string,
      notes: formData.get('notes') as string,
      processedBy: formData.get('processedBy') as string
    };

    const billId = parseInt(formData.get('billId') as string);

    try {
      await billingApi.addPayment(billId, paymentData);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      Swal.fire('Success!', 'Payment added successfully.', 'success');
      setShowAddPaymentModal(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      Swal.fire('Error!', 'Failed to add payment.', 'error');
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Payment Added',
      text: 'Payment has been successfully recorded',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (error) {
    return (
      <Alert variant="danger">
        Error loading payments: {error.message}
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <PageHeader 
        title="Payments Management" 
        subtitle="Track and manage patient payments"
      />
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search payments by number, reference, or processor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
              >
                <option value="">All Methods</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                  <option key={method} value={method}>{label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button 
                variant="primary" 
                onClick={() => setShowAddPaymentModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Payment
              </Button>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading payments...</div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-credit-card display-4 d-block mb-3"></i>
              <h5>No payments found</h5>
              <p>Add your first payment to get started</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Payment Number</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Processed By</th>
                    <th>Payment Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="fw-semibold">{payment.paymentNumber}</td>
                      <td className="fw-semibold">{formatCurrency(payment.amount)}</td>
                      <td>
                        <Badge bg="info">
                          {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(payment.status)}>
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </Badge>
                      </td>
                      <td>{payment.referenceNumber || '-'}</td>
                      <td>{payment.processedBy || '-'}</td>
                      <td>{formatDateTime(payment.paymentDate)}</td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" variant="outline-primary">
                            View
                          </Button>
                          {payment.status === 'COMPLETED' && (
                            <Button size="sm" variant="outline-warning">
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Payment Modal */}
      <Modal show={showAddPaymentModal} onHide={() => setShowAddPaymentModal(false)} centered>
        <Form onSubmit={handleAddPayment}>
          <Modal.Header closeButton>
            <Modal.Title>Add Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Bill ID</Form.Label>
              <Form.Control 
                name="billId" 
                type="number" 
                required 
                placeholder="Enter bill ID"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select name="paymentMethod" required>
                <option value="">Select method</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                  <option key={method} value={method}>{label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control 
                name="referenceNumber" 
                placeholder="Transaction reference (optional)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Processed By</Form.Label>
              <Form.Control 
                name="processedBy" 
                required 
                placeholder="Staff member name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                name="notes" 
                as="textarea" 
                rows={3} 
                placeholder="Additional notes (optional)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddPaymentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
