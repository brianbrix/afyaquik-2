import React, { useState } from 'react';
import { Card, Table, Button, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { FormModal } from '../../../components/shared/FormModal';
import { ReactPaginateComponent } from '../../../components/shared/ReactPaginate';
import Swal from 'sweetalert2';

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  requiresAuthorization: boolean;
  processingFeePercentage: number;
  sortOrder: number;
}

interface CreatePaymentMethodRequest {
  name: string;
  code: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'INSURANCE' | 'CHEQUE' | 'OTHER';
  description?: string;
  isActive: boolean;
  requiresAuthorization: boolean;
  processingFeePercentage: number;
  sortOrder: number;
}

export function PaymentMethodsAdminPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading, error } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethod[]> => {
      const res = await apiClient.get('/billing/payment-methods');
      return res.data?.data ?? res.data;
    }
  });

  // Create payment method mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreatePaymentMethodRequest) => {
      const res = await apiClient.post('/billing/payment-methods', data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowCreateModal(false);
      Swal.fire({ icon: 'success', title: 'Payment method created', timer: 1500, showConfirmButton: false });
    }
  });

  // Update payment method mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreatePaymentMethodRequest }) => {
      const res = await apiClient.put(`/billing/payment-methods/${id}`, data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowEditModal(false);
      setEditingMethod(null);
      Swal.fire({ icon: 'success', title: 'Payment method updated', timer: 1500, showConfirmButton: false });
    }
  });

  // Delete payment method mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/billing/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      Swal.fire({ icon: 'success', title: 'Payment method deleted', timer: 1500, showConfirmButton: false });
    }
  });

  // Filter payment methods
  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (method.description && method.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const paginatedMethods = filteredMethods.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(filteredMethods.length / pageSize);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data: CreatePaymentMethodRequest = {
      name: formData.get('name') as string,
      code: formData.get('code') as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'INSURANCE' | 'CHEQUE' | 'OTHER',
      description: formData.get('description') as string || undefined,
      isActive: formData.get('isActive') === 'on',
      requiresAuthorization: formData.get('requiresAuthorization') === 'on',
      processingFeePercentage: Number(formData.get('processingFeePercentage')),
      sortOrder: Number(formData.get('sortOrder'))
    };

    try {
      await createMutation.mutateAsync(data);
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create payment method' });
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMethod) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data: CreatePaymentMethodRequest = {
      name: formData.get('name') as string,
      code: formData.get('code') as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'INSURANCE' | 'CHEQUE' | 'OTHER',
      description: formData.get('description') as string || undefined,
      isActive: formData.get('isActive') === 'on',
      requiresAuthorization: formData.get('requiresAuthorization') === 'on',
      processingFeePercentage: Number(formData.get('processingFeePercentage')),
      sortOrder: Number(formData.get('sortOrder'))
    };

    try {
      await updateMutation.mutateAsync({ id: editingMethod.id, data });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update payment method' });
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    const result = await Swal.fire({
      title: 'Delete Payment Method?',
      text: `Are you sure you want to delete "${method.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(method.id);
      } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete payment method' });
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4"><Spinner animation="border" /> Loading payment methods...</div>;
  }

  if (error) {
    return <Alert variant="danger">Failed to load payment methods</Alert>;
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h1 className="h4 mb-1 d-flex align-items-center">
            <i className="bi bi-credit-card me-2 text-primary"></i>
            Payment Methods
          </h1>
          <p className="text-muted mb-0">Configure payment methods, processing fees, and authorization requirements.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)} className="d-flex align-items-center">
          <i className="bi bi-plus-circle me-2"></i>
          Add Payment Method
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search payment methods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Fee %</th>
                  <th>Auth Required</th>
                  <th>Sort Order</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMethods.map(method => (
                  <tr key={method.id}>
                    <td className="fw-semibold">{method.name}</td>
                    <td><code>{method.code}</code></td>
                    <td>{method.description || '—'}</td>
                    <td>
                      <Badge bg={method.isActive ? 'success' : 'secondary'}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{method.processingFeePercentage}%</td>
                    <td>
                      <Badge bg={method.requiresAuthorization ? 'warning' : 'info'}>
                        {method.requiresAuthorization ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>{method.sortOrder}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setEditingMethod(method);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(method)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedMethods.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No payment methods found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <Row className="align-items-center mt-3">
            <Col md={6}>
              <div className="text-muted small">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredMethods.length)} of {filteredMethods.length} payment methods
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 small">Show:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="small text-muted">entries</span>
                </div>
                <ReactPaginateComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <FormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        title="Create Payment Method"
        onSubmit={handleCreate}
        submitLabel="Create"
        cancelLabel="Cancel"
        isSubmitting={createMutation.isPending}
      >
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control name="name" required placeholder="e.g., Credit Card" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Payment Type *</Form.Label>
          <Form.Select name="code" required>
            <option value="">Select payment type</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="INSURANCE">Insurance</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" rows={3} placeholder="Optional description" />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Processing Fee %</Form.Label>
              <Form.Control
                type="number"
                name="processingFeePercentage"
                step="0.01"
                min="0"
                max="100"
                defaultValue="0"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control
                type="number"
                name="sortOrder"
                min="0"
                defaultValue="0"
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="isActive"
            label="Active"
            defaultChecked
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="requiresAuthorization"
            label="Requires Authorization"
          />
        </Form.Group>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingMethod(null);
        }}
        title="Edit Payment Method"
        onSubmit={handleEdit}
        submitLabel="Update"
        cancelLabel="Cancel"
        isSubmitting={updateMutation.isPending}
      >
        {editingMethod && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control name="name" required defaultValue={editingMethod.name} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Type *</Form.Label>
              <Form.Select name="code" required defaultValue={editingMethod.code}>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="INSURANCE">Insurance</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                defaultValue={editingMethod.description || ''}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Processing Fee %</Form.Label>
                  <Form.Control
                    type="number"
                    name="processingFeePercentage"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={editingMethod.processingFeePercentage}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control
                    type="number"
                    name="sortOrder"
                    min="0"
                    defaultValue={editingMethod.sortOrder}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                label="Active"
                defaultChecked={editingMethod.isActive}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="requiresAuthorization"
                label="Requires Authorization"
                defaultChecked={editingMethod.requiresAuthorization}
              />
            </Form.Group>
          </>
        )}
      </FormModal>
    </div>
  );
}
