import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Table, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { departmentApi, Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../../../services/departmentApi';
import Swal from 'sweetalert2';

export function DepartmentManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    departmentId: '',
    displayName: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: departments = [], isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      setFormData({ departmentId: '', displayName: '', description: '' });
      Swal.fire('Success', 'Department created successfully!', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to create department: ${error.message}`, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) =>
      departmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ departmentId: '', displayName: '', description: '' });
      Swal.fire('Success', 'Department updated successfully!', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to update department: ${error.message}`, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      Swal.fire('Success', 'Department deleted successfully!', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to delete department: ${error.message}`, 'error');
    }
  });

  const handleCreate = () => {
    setEditingDepartment(null);
    setFormData({ departmentId: '', displayName: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      departmentId: department.departmentId,
      displayName: department.displayName,
      description: department.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (department: Department) => {
    const result = await Swal.fire({
      title: 'Delete Department?',
      text: `Are you sure you want to delete "${department.displayName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(department.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDepartment) {
      updateMutation.mutate({
        id: editingDepartment.id,
        data: {
          displayName: formData.displayName,
          description: formData.description
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ departmentId: '', displayName: '', description: '' });
  };

  return (
    <div className="container-fluid py-4">
      <PageHeader
        title="Department Management"
        subtitle="Manage departments for test catalog and organizational structure"
      />

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Departments</h5>
          <Button variant="primary" onClick={handleCreate}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Department
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading departments...</span>
              </Spinner>
            </div>
          )}

          {error && (
            <Alert variant="danger">
              Failed to load departments. Please try again.
            </Alert>
          )}

          {!isLoading && !error && (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Department ID</th>
                    <th>Display Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No departments found. Create your first department to get started.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                      <tr key={department.id}>
                        <td>
                          <Badge bg="secondary">{department.departmentId}</Badge>
                        </td>
                        <td className="fw-semibold">{department.displayName}</td>
                        <td>{department.description || '—'}</td>
                        <td>
                          {new Date(department.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(department)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(department)}
                              disabled={deleteMutation.isPending}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Department Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Department ID <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., cardiology, radiology"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                disabled={!!editingDepartment}
                required
              />
              <Form.Text className="text-muted">
                {editingDepartment 
                  ? "Department ID cannot be changed after creation"
                  : "Unique identifier for the department (lowercase, no spaces)"
                }
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Display Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Cardiology Department"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of the department's purpose and responsibilities"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              {editingDepartment ? 'Update Department' : 'Create Department'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
