import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Table, Alert, Badge } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface BillingItem {
  id: number;
  itemCode: string;
  description: string;
  unitPrice: number;
  serviceCategory: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BillingItemRequest {
  itemCode: string;
  description: string;
  unitPrice: number;
  serviceCategory: string;
  isActive: boolean;
}

const SERVICE_CATEGORIES = [
  'CONSULTATION',
  'PHARMACY',
  'DIAGNOSTICS',
  'LABORATORY',
  'RADIOLOGY',
  'SURGERY',
  'EMERGENCY',
  'INPATIENT',
  'OUTPATIENT',
  'OTHER'
];

export function BillingItemsAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BillingItem | null>(null);
  const [formData, setFormData] = useState<BillingItemRequest>({
    itemCode: '',
    description: '',
    unitPrice: 0,
    serviceCategory: 'CONSULTATION',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const queryClient = useQueryClient();

  // Fetch billing items
  const { data: billingItems = [], isLoading, error } = useQuery({
    queryKey: ['billing-items'],
    queryFn: async () => {
      const response = await apiClient.get('/billing/items');
      return response.data.data;
    }
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: BillingItemRequest) => {
      if (editingItem) {
        const response = await apiClient.put(`/billing/items/${editingItem.id}`, data);
        return response.data.data;
      } else {
        const response = await apiClient.post('/billing/items', data);
        return response.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-items'] });
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        itemCode: '',
        description: '',
        unitPrice: 0,
        serviceCategory: 'CONSULTATION',
        isActive: true
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingItem ? 'Billing item updated successfully' : 'Billing item created successfully',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to save billing item'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/billing/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-items'] });
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Billing item deleted successfully',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to delete billing item'
      });
    }
  });

  const handleEdit = (item: BillingItem) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      description: item.description,
      unitPrice: item.unitPrice,
      serviceCategory: item.serviceCategory,
      isActive: item.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Delete Billing Item',
      text: 'Are you sure you want to delete this billing item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUpdateMutation.mutate(formData);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      itemCode: '',
      description: '',
      unitPrice: 0,
      serviceCategory: 'CONSULTATION',
      isActive: true
    });
  };

  // Filter items
  const filteredItems = billingItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Billing Items Management"
        subtitle="Manage billing items that can be added to patient bills"
      />

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: '300px' }}
                />
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="">All Categories</option>
                  {SERVICE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col md={6} className="text-end">
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Billing Item
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger">
              Failed to load billing items. Please try again.
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Unit Price</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.itemCode}</td>
                    <td>{item.description}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>
                      <Badge bg="secondary">{item.serviceCategory}</Badge>
                    </td>
                    <td>
                      <Badge bg={item.isActive ? 'success' : 'danger'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {filteredItems.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted">
              No billing items found.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Edit Billing Item' : 'Add New Billing Item'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.itemCode}
                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    placeholder="e.g., CONSULT-001"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Service Category *</Form.Label>
                  <Form.Select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    required
                  >
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., General Consultation"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createUpdateMutation.isPending}
            >
              {createUpdateMutation.isPending ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
