import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { diagnosticsAdminApi, testCatalogApi } from '../../../services/diagnosticsApi';

interface ResultTemplate {
  id: number;
  testCatalogId: number;
  testName: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldOptions: string;
  required: boolean;
  sortOrder: number;
  validationRules: string;
  normalRange: string;
  units: string;
  active: boolean;
}

interface TestCatalog {
  id: number;
  testCode: string;
  testName: string;
  testType: string;
}

export function ResultTemplateAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResultTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTestCatalog, setFilterTestCatalog] = useState('');
  const [filterFieldType, setFilterFieldType] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  const queryClient = useQueryClient();

  const { data: resultTemplates = [], isLoading } = useQuery({
    queryKey: ['result-templates', searchTerm, filterTestCatalog, filterFieldType, filterActive],
    queryFn: () => diagnosticsAdminApi.getResultTemplates(),
  });

  const { data: testCatalogs = [] } = useQuery({
    queryKey: ['test-catalogs-for-templates'],
    queryFn: () => testCatalogApi.getAll({ active: true }),
  });

  const createMutation = useMutation({
    mutationFn: (template: Partial<ResultTemplate>) => diagnosticsAdminApi.createResultTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result-templates'] });
      setShowModal(false);
      Swal.fire('Success', 'Result template created successfully', 'success');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (template: ResultTemplate) => diagnosticsAdminApi.updateResultTemplate(template.id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result-templates'] });
      setShowModal(false);
      setEditingTemplate(null);
      Swal.fire('Success', 'Result template updated successfully', 'success');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => diagnosticsAdminApi.deleteResultTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result-templates'] });
      Swal.fire('Success', 'Result template deleted successfully', 'success');
    }
  });

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: ResultTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Delete Result Template?',
      text: 'Are you sure you want to delete this result template?',
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

  const handleSubmit = (template: Partial<ResultTemplate>) => {
    if (editingTemplate) {
      updateMutation.mutate(template as ResultTemplate);
    } else {
      createMutation.mutate(template);
    }
  };

  const filteredTemplates = resultTemplates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.fieldName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestCatalog = !filterTestCatalog || template.testCatalogId.toString() === filterTestCatalog;
    const matchesFieldType = !filterFieldType || template.fieldType === filterFieldType;
    const matchesActive = filterActive === null || template.active === filterActive;
    
    return matchesSearch && matchesTestCatalog && matchesFieldType && matchesActive;
  });

  const fieldTypes = ['TEXT', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TIME', 'DATETIME', 'DROPDOWN', 'MULTI_SELECT', 'TEXTAREA', 'RICH_TEXT', 'FILE', 'IMAGE'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Result Template Management</h5>
        <Button variant="primary" onClick={handleCreate}>
          <i className="bi bi-plus me-1"></i>
          Add Result Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterTestCatalog}
                onChange={(e) => setFilterTestCatalog(e.target.value)}
              >
                <option value="">All Tests</option>
                {testCatalogs.map(catalog => (
                  <option key={catalog.id} value={catalog.id}>{catalog.testName}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterFieldType}
                onChange={(e) => setFilterFieldType(e.target.value)}
              >
                <option value="">All Types</option>
                {fieldTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterTestCatalog('');
                  setFilterFieldType('');
                  setFilterActive(null);
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Result Templates Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading result templates...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Field Name</th>
                  <th>Field Label</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Normal Range</th>
                  <th>Units</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map(template => (
                  <tr key={template.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{template.testName}</div>
                      </div>
                    </td>
                    <td>
                      <code>{template.fieldName}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">{template.fieldLabel}</div>
                    </td>
                    <td>
                      <Badge bg="info">{template.fieldType}</Badge>
                    </td>
                    <td>
                      {template.required ? (
                        <Badge bg="danger">Required</Badge>
                      ) : (
                        <Badge bg="secondary">Optional</Badge>
                      )}
                    </td>
                    <td>
                      <div className="text-muted small">
                        {template.normalRange}
                      </div>
                    </td>
                    <td>
                      <div className="text-muted small">
                        {template.units}
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{template.sortOrder}</Badge>
                    </td>
                    <td>
                      <Badge bg={template.active ? 'success' : 'danger'}>
                        {template.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleEdit(template)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(template.id)}
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
      <ResultTemplateModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        testCatalogs={testCatalogs}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

interface ResultTemplateModalProps {
  show: boolean;
  onHide: () => void;
  template: ResultTemplate | null;
  testCatalogs: TestCatalog[];
  onSubmit: (template: Partial<ResultTemplate>) => void;
  isLoading: boolean;
}

function ResultTemplateModal({ show, onHide, template, testCatalogs, onSubmit, isLoading }: ResultTemplateModalProps) {
  const [formData, setFormData] = useState<Partial<ResultTemplate>>({
    testCatalogId: 0,
    fieldName: '',
    fieldLabel: '',
    fieldType: 'TEXT',
    fieldOptions: '',
    required: false,
    sortOrder: 0,
    validationRules: '',
    normalRange: '',
    units: '',
    active: true
  });

  React.useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        testCatalogId: 0,
        fieldName: '',
        fieldLabel: '',
        fieldType: 'TEXT',
        fieldOptions: '',
        required: false,
        sortOrder: 0,
        validationRules: '',
        normalRange: '',
        units: '',
        active: true
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const fieldTypes = ['TEXT', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TIME', 'DATETIME', 'DROPDOWN', 'MULTI_SELECT', 'TEXTAREA', 'RICH_TEXT', 'FILE', 'IMAGE'];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{template ? 'Edit Result Template' : 'Create Result Template'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Test Catalog *</Form.Label>
                <Form.Select
                  value={formData.testCatalogId || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, testCatalogId: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select Test</option>
                  {testCatalogs.map(catalog => (
                    <option key={catalog.id} value={catalog.id}>{catalog.testName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Field Type *</Form.Label>
                <Form.Select
                  value={formData.fieldType || 'TEXT'}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldType: e.target.value }))}
                  required
                >
                  {fieldTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Field Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fieldName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Field Label *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fieldLabel || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldLabel: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>Normal Range</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.normalRange || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, normalRange: e.target.value }))}
                  placeholder="e.g., 4.5-11.0"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Units</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.units || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value }))}
                  placeholder="e.g., x10^9/L"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Field Options (JSON for dropdowns)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.fieldOptions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, fieldOptions: e.target.value }))}
              placeholder='["Option 1", "Option 2", "Option 3"]'
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Validation Rules (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.validationRules || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, validationRules: e.target.value }))}
              placeholder='{"min": 0, "max": 100, "required": true}'
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Required"
              checked={formData.required || false}
              onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
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
              {template ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            template ? 'Update' : 'Create'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
