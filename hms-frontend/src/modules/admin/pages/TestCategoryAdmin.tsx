import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { diagnosticsAdminApi } from '../../../services/diagnosticsApi';

interface TestCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  testType: string;
  active: boolean;
  sortOrder: number;
}

export function TestCategoryAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTestType, setFilterTestType] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  const queryClient = useQueryClient();

  const { data: testCategories = [], isLoading } = useQuery({
    queryKey: ['test-categories', searchTerm, filterTestType, filterActive],
    queryFn: () => diagnosticsAdminApi.getTestCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (category: Partial<TestCategory>) => diagnosticsAdminApi.createTestCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-categories'] });
      setShowModal(false);
      Swal.fire('Success', 'Test category created successfully', 'success');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (category: TestCategory) => diagnosticsAdminApi.updateTestCategory(category.id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-categories'] });
      setShowModal(false);
      setEditingCategory(null);
      Swal.fire('Success', 'Test category updated successfully', 'success');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => diagnosticsAdminApi.deleteTestCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-categories'] });
      Swal.fire('Success', 'Test category deleted successfully', 'success');
    }
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: TestCategory) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Delete Test Category?',
      text: 'Are you sure you want to delete this test category?',
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

  const handleSubmit = (category: Partial<TestCategory>) => {
    if (editingCategory) {
      updateMutation.mutate(category as TestCategory);
    } else {
      createMutation.mutate(category);
    }
  };

  const filteredCategories = testCategories.filter(category => {
    const matchesSearch = !searchTerm || 
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestType = !filterTestType || category.testType === filterTestType;
    const matchesActive = filterActive === null || category.active === filterActive;
    
    return matchesSearch && matchesTestType && matchesActive;
  });

  const testTypes = ['LABORATORY', 'RADIOLOGY', 'PATHOLOGY', 'CARDIOLOGY', 'PULMONOLOGY', 'NEUROLOGY', 'OTHER'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Test Category Management</h5>
        <Button variant="primary" onClick={handleCreate}>
          <i className="bi bi-plus me-1"></i>
          Add Test Category
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterTestType}
                onChange={(e) => setFilterTestType(e.target.value)}
              >
                <option value="">All Test Types</option>
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterTestType('');
                  setFilterActive(null);
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Test Categories Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading test categories...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Sort</th>
                  <th>Code</th>
                  <th>Category Name</th>
                  <th>Test Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(category => (
                  <tr key={category.id}>
                    <td>
                      <Badge bg="secondary">{category.sortOrder}</Badge>
                    </td>
                    <td>
                      <code>{category.categoryCode}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">{category.categoryName}</div>
                    </td>
                    <td>
                      <Badge bg="info">{category.testType}</Badge>
                    </td>
                    <td>
                      <div className="text-muted small">
                        {category.description}
                      </div>
                    </td>
                    <td>
                      <Badge bg={category.active ? 'success' : 'danger'}>
                        {category.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
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
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <TestCategoryModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

interface TestCategoryModalProps {
  show: boolean;
  onHide: () => void;
  category: TestCategory | null;
  onSubmit: (category: Partial<TestCategory>) => void;
  isLoading: boolean;
}

function TestCategoryModal({ show, onHide, category, onSubmit, isLoading }: TestCategoryModalProps) {
  const [formData, setFormData] = useState<Partial<TestCategory>>({
    categoryCode: '',
    categoryName: '',
    description: '',
    testType: 'LABORATORY',
    active: true,
    sortOrder: 0
  });

  React.useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        categoryCode: '',
        categoryName: '',
        description: '',
        testType: 'LABORATORY',
        active: true,
        sortOrder: 0
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const testTypes = ['LABORATORY', 'RADIOLOGY', 'PATHOLOGY', 'CARDIOLOGY', 'PULMONOLOGY', 'NEUROLOGY', 'OTHER'];

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{category ? 'Edit Test Category' : 'Create Test Category'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.categoryCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryCode: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.categoryName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Test Type *</Form.Label>
                <Form.Select
                  value={formData.testType || 'LABORATORY'}
                  onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
                  required
                >
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sort Order *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Active"
              checked={formData.active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            category ? 'Update' : 'Create'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
