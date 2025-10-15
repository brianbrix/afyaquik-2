import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { FormModal } from '../../../components/shared/FormModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, Bill, BillStatus, BILL_STATUS_LABELS } from '../../../services/billingApi';
import { useAuth } from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

export function BillsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Fetch bills (this would need to be implemented in the backend)
  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ['bills', statusFilter],
    queryFn: async () => {
      try {
        return await billingApi.getAllBills({ status: statusFilter });
      } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
      }
    }
  });

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: BillStatus) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'OVERDUE': return 'danger';
      case 'DRAFT': return 'secondary';
      case 'SENT': return 'info';
      case 'CANCELLED': return 'dark';
      case 'REFUNDED': return 'light';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const billData = {
        patientId: parseInt(formData.get('patientId') as string),
        patientName: formData.get('patientName') as string,
        items: [{
          description: formData.get('description') as string,
          quantity: parseInt(formData.get('quantity') as string),
          unitPrice: parseFloat(formData.get('unitPrice') as string),
          category: formData.get('category') as string,
          notes: formData.get('notes') as string
        }],
        notes: formData.get('notes') as string
      };
      
      await billingApi.createBill(billData);
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      Swal.fire('Success!', 'Bill created successfully.', 'success');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating bill:', error);
      Swal.fire('Error!', 'Failed to create bill.', 'error');
    }
  };

  const handleStatusUpdate = async (billId: number, newStatus: BillStatus) => {
    try {
      await billingApi.updateBillStatus(billId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Bill status updated to ${BILL_STATUS_LABELS[newStatus]}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update bill status'
      });
    }
  };

  if (error) {
    return (
      <Alert variant="danger">
        Error loading bills: {error.message}
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <PageHeader 
        title="Bills Management" 
        subtitle="Manage patient bills, payments, and billing status"
      />
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search bills by number or patient name..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BillStatus | '')}
              >
                <option value="">All Statuses</option>
                {Object.entries(BILL_STATUS_LABELS).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button 
                variant="primary" 
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Bill
              </Button>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading bills...</div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-receipt display-4 d-block mb-3"></i>
              <h5>No bills found</h5>
              <p>Create your first bill to get started</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance Due</th>
                    <th>Billing Date</th>
                    <th>Due Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="fw-semibold">{bill.billNumber}</td>
                      <td>{bill.patientName}</td>
                      <td>
                        <Badge bg={getStatusVariant(bill.status)}>
                          {BILL_STATUS_LABELS[bill.status]}
                        </Badge>
                      </td>
                      <td className="fw-semibold">{formatCurrency(bill.totalAmount)}</td>
                      <td>{formatCurrency(bill.paidAmount)}</td>
                      <td className={bill.balanceDue > 0 ? 'text-danger fw-semibold' : 'text-success'}>
                        {formatCurrency(bill.balanceDue)}
                      </td>
                      <td>{bill.billingDate ? formatDate(bill.billingDate) : '-'}</td>
                      <td>{bill.dueDate ? formatDate(bill.dueDate) : '-'}</td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" variant="outline-primary">
                            View
                          </Button>
                          {bill.status === 'DRAFT' && (
                            <Button 
                              size="sm" 
                              variant="outline-success"
                              onClick={() => handleStatusUpdate(bill.id, 'SENT')}
                            >
                              Send
                            </Button>
                          )}
                          {bill.balanceDue > 0 && (
                            <Button size="sm" variant="outline-warning">
                              Add Payment
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

      {/* Create Bill Modal */}
      <FormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateBill}
        title="Create New Bill"
        submitText="Create Bill"
      >
        <Form.Group className="mb-3">
          <Form.Label>Patient Name</Form.Label>
          <Form.Control name="patientName" required />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Patient ID</Form.Label>
          <Form.Control name="patientId" type="number" required />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Payment Terms</Form.Label>
          <Form.Control name="paymentTerms" placeholder="e.g., Net 30 days" />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Due Date</Form.Label>
          <Form.Control name="dueDate" type="date" />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control name="notes" as="textarea" rows={3} />
        </Form.Group>
      </FormModal>
    </div>
  );
}
