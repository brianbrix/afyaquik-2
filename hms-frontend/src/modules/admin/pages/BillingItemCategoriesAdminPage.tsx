import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Table, Alert, Badge } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface BillingItemCategory {
  id: number;
  categoryName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BillingItemCategoryRequest {
  categoryName: string;
  description: string;
  isActive: boolean;
}

export function BillingItemCategoriesAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BillingItemCategory | null>(null);
  const [formData, setFormData] = useState<BillingItemCategoryRequest>({
    categoryName: '',
    description: '',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Fetch billing item categories
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['billing-item-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/billing/item-categories');
      return response.data.data;
    }
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: BillingItemCategoryRequest) => {
      if (editingCategory) {
        const response = await apiClient.put(`/billing/item-categories/${editingCategory.id}`, data);
        return response.data.data;
      } else {
        const response = await apiClient.post('/billing/item-categories', data);
        return response.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-item-categories'] });
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        categoryName: '',
        description: '',
        isActive: true
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingCategory ? 'Billing item category updated successfully' : 'Billing item category created successfully',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to save billing item category'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/billing/item-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-item-categories'] });
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Billing item category deleted successfully',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Failed to delete billing item category'
      });
    }
  });

  const handleEdit = (category: BillingItemCategory) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Delete Billing Item Category',
      text: 'Are you sure you want to delete this billing item category?',
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
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      description: '',
      isActive: true
    });
  };

  // Filter categories
  const filteredCategories = categories.filter(category => 
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Billing Item Categories Management"
        subtitle="Manage categories for billing items"
      />

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
            </Col>
            <Col md={6} className="text-end">
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Category
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger">
              Failed to load billing item categories. Please try again.
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
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="fw-semibold">{category.categoryName}</td>
                    <td>{category.description || '—'}</td>
                    <td>
                      <Badge bg={category.isActive ? 'success' : 'danger'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEdit(category)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(category.id)}
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

          {filteredCategories.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted">
              No billing item categories found.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Billing Item Category' : 'Add New Billing Item Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                placeholder="e.g., Pharmacy"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </Form.Group>

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
              {createUpdateMutation.isPending ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
