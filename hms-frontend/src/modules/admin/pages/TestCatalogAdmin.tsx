import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { diagnosticsAdminApi, testCatalogApi, testCategoryApi, TestCategory as TestCategoryType } from '../../../services/diagnosticsApi';

interface TestCatalog {
  id: number;
  testCode: string;
  testName: string;
  description?: string;
  testCategoryId: number;
  categoryName: string;
  testType: string;
  cost: number;
  department: string;
  departmentName: string;
  active: boolean;
  instructions?: string;
  preparationInstructions?: string;
  estimatedDurationMinutes: number;
}

interface TestCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  testType: string;
  active: boolean;
}

export function TestCatalogAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<TestCatalog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  const queryClient = useQueryClient();

  // Real API calls
  const { data: testCatalogs = [], isLoading } = useQuery({
    queryKey: ['test-catalogs', searchTerm, filterDepartment, filterCategory, filterActive],
    queryFn: () => diagnosticsAdminApi.getTestCatalogs(),
  });

  const { data: testCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<TestCategoryType[]>({
    queryKey: ['test-categories'],
    queryFn: () => testCategoryApi.getAll({ active: true }),
  });

  const { data: departments = [], isLoading: departmentsLoading, error: departmentsError } = useQuery<string[]>({
    queryKey: ['departments'],
    queryFn: () => testCatalogApi.getDepartments(),
  });

  // Debug logging
  React.useEffect(() => {
    if (categoriesError) {
      console.error('Error fetching test categories:', categoriesError);
    } else {
      console.log('Test categories loaded:', testCategories);
    }
  }, [testCategories, categoriesError]);

  React.useEffect(() => {
    if (departmentsError) {
      console.error('Error fetching departments:', departmentsError);
    } else {
      console.log('Departments loaded:', departments);
    }
  }, [departments, departmentsError]);

  const createMutation = useMutation({
    mutationFn: (catalog: Partial<TestCatalog>) => diagnosticsAdminApi.createTestCatalog(catalog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-catalogs'] });
      setShowModal(false);
      Swal.fire('Success', 'Test catalog created successfully', 'success');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (catalog: TestCatalog) => diagnosticsAdminApi.updateTestCatalog(catalog.id, catalog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-catalogs'] });
      setShowModal(false);
      setEditingCatalog(null);
      Swal.fire('Success', 'Test catalog updated successfully', 'success');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => diagnosticsAdminApi.deleteTestCatalog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-catalogs'] });
      Swal.fire('Success', 'Test catalog deleted successfully', 'success');
    }
  });

  const handleCreate = () => {
    setEditingCatalog(null);
    setShowModal(true);
  };

  const handleEdit = (catalog: TestCatalog) => {
    setEditingCatalog(catalog);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Delete Test Catalog?',
      text: 'Are you sure you want to delete this test catalog?',
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

  const handleSubmit = (catalog: Partial<TestCatalog>) => {
    if (editingCatalog) {
      updateMutation.mutate(catalog as TestCatalog);
    } else {
      createMutation.mutate(catalog);
    }
  };

  const filteredCatalogs = testCatalogs.filter(catalog => {
    const matchesSearch = !searchTerm || 
      catalog.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.testCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || catalog.department === filterDepartment;
    const matchesCategory = !filterCategory || catalog.testCategoryId.toString() === filterCategory;
    const matchesActive = filterActive === null || catalog.active === filterActive;
    
    return matchesSearch && matchesDepartment && matchesCategory && matchesActive;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Test Catalog Management</h5>
        <Button variant="primary" onClick={handleCreate}>
          <i className="bi bi-plus me-1"></i>
          Add Test Catalog
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {testCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.categoryName}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterCategory('');
                  setFilterActive(null);
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Test Catalogs Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading test catalogs...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Test Code</th>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Cost</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalogs.map(catalog => (
                  <tr key={catalog.id}>
                    <td>
                      <code>{catalog.testCode}</code>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{catalog.testName}</div>
                        {catalog.description && (
                          <small className="text-muted">{catalog.description}</small>
                        )}
                      </div>
                    </td>
                    <td>{catalog.categoryName}</td>
                    <td>
                      <Badge bg="secondary">{catalog.department}</Badge>
                    </td>
                    <td>
                      <Badge bg="info">{catalog.testType}</Badge>
                    </td>
                    <td>${catalog.cost.toFixed(2)}</td>
                    <td>{catalog.estimatedDurationMinutes} min</td>
                    <td>
                      <Badge bg={catalog.active ? 'success' : 'danger'}>
                        {catalog.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEdit(catalog)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(catalog.id)}
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
      <TestCatalogModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingCatalog(null);
        }}
        catalog={editingCatalog}
        testCategories={testCategories}
        departments={departments}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

interface TestCatalogModalProps {
  show: boolean;
  onHide: () => void;
  catalog: TestCatalog | null;
  testCategories: TestCategory[];
  departments: string[];
  onSubmit: (catalog: Partial<TestCatalog>) => void;
  isLoading: boolean;
}

function TestCatalogModal({ show, onHide, catalog, testCategories, departments, onSubmit, isLoading }: TestCatalogModalProps) {
  const [formData, setFormData] = useState<Partial<TestCatalog>>({
    testCode: '',
    testName: '',
    description: '',
    testCategoryId: 0,
    testType: 'LABORATORY',
    cost: 0,
    department: '',
    departmentName: '',
    active: true,
    instructions: '',
    preparationInstructions: '',
    estimatedDurationMinutes: 0
  });

  React.useEffect(() => {
    if (catalog) {
      setFormData(catalog);
    } else {
      setFormData({
        testCode: '',
        testName: '',
        description: '',
        testCategoryId: 0,
        testType: 'LABORATORY',
        cost: 0,
        department: '',
        departmentName: '',
        active: true,
        instructions: '',
        preparationInstructions: '',
        estimatedDurationMinutes: 0
      });
    }
  }, [catalog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{catalog ? 'Edit Test Catalog' : 'Create Test Catalog'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Test Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.testCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, testCode: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Test Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.testName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={formData.testCategoryId || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, testCategoryId: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select Category</option>
                  {testCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.categoryName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Test Type *</Form.Label>
                <Form.Select
                  value={formData.testType || 'LABORATORY'}
                  onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
                  required
                >
                  <option value="LABORATORY">Laboratory</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="PATHOLOGY">Pathology</option>
                  <option value="CARDIOLOGY">Cardiology</option>
                  <option value="PULMONOLOGY">Pulmonology</option>
                  <option value="NEUROLOGY">Neurology</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Department *</Form.Label>
                <Form.Select
                  value={formData.department || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value, departmentName: e.target.value }))}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cost *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.cost || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Duration (minutes) *</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.estimatedDurationMinutes || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDurationMinutes: parseInt(e.target.value) }))}
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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instructions for performing the test"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Preparation Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.preparationInstructions || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparationInstructions: e.target.value }))}
                  placeholder="Patient preparation instructions"
                />
              </Form.Group>
            </Col>
          </Row>

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
              {catalog ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            catalog ? 'Update' : 'Create'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
