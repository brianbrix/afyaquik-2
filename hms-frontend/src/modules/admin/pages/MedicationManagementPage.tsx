import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Table, InputGroup, Spinner, Alert, Modal, Badge } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi, DOSAGE_FORM_OPTIONS, type Medication, type MedicationRequest } from '../../../services/pharmacyApi';
import { useCurrency } from '../../../hooks/useCurrency';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import Swal from 'sweetalert2';

export function MedicationManagementPage() {
  const { formatCurrency } = useCurrency();
  const { permissions, loading: permissionsLoading } = useResolvedPermissions();
  const queryClient = useQueryClient();
  
  // Check if user has permission to manage medications
  const canManageMedications = hasPermission(permissions, 'MANAGE_MEDICATIONS');
  
  // State for modals and forms - ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [filterControlled, setFilterControlled] = useState<boolean | undefined>(undefined);
  
  // Form state
  const [formData, setFormData] = useState<MedicationRequest>({
    medicationCode: '',
    name: '',
    genericName: '',
    manufacturer: '',
    dosageForm: 'TABLET',
    strength: '',
    unitOfMeasure: '',
    description: '',
    unitPrice: 0,
    controlledSubstance: false,
    requiresPrescription: true,
    active: true
  });

  // Fetch medications
  const { data: medications, isLoading, error, refetch } = useQuery({
    queryKey: ['medications', { searchQuery, filterActive, filterControlled }],
    queryFn: () => {
      const params: any = {};
      if (filterActive !== undefined) params.active = filterActive;
      if (filterControlled !== undefined) params.controlled = filterControlled;
      
      if (searchQuery.trim()) {
        return medicationApi.search(searchQuery);
      }
      return medicationApi.getAll(params);
    }
  });

  // Create medication mutation
  const createMutation = useMutation({
    mutationFn: (data: MedicationRequest) => medicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowCreateModal(false);
      resetForm();
      Swal.fire({ icon: 'success', title: 'Success', text: 'Medication created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create medication' });
    }
  });

  // Update medication mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicationRequest }) => medicationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowEditModal(false);
      setEditingMedication(null);
      resetForm();
      Swal.fire({ icon: 'success', title: 'Success', text: 'Medication updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update medication' });
    }
  });

  // Delete medication mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Medication deleted successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete medication' });
    }
  });

  const resetForm = () => {
    setFormData({
      medicationCode: '',
      name: '',
      genericName: '',
      manufacturer: '',
      dosageForm: 'TABLET',
      strength: '',
      unitOfMeasure: '',
      description: '',
      unitPrice: 0,
      controlledSubstance: false,
      requiresPrescription: true,
      active: true
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.medicationCode.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Name and medication code are required' });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      medicationCode: medication.medicationCode,
      name: medication.name,
      genericName: medication.genericName || '',
      manufacturer: medication.manufacturer || '',
      dosageForm: medication.dosageForm || 'TABLET',
      strength: medication.strength || '',
      unitOfMeasure: medication.unitOfMeasure || '',
      description: medication.description || '',
      unitPrice: medication.unitPrice || 0,
      controlledSubstance: medication.controlledSubstance,
      requiresPrescription: medication.requiresPrescription,
      active: medication.active
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingMedication) return;
    if (!formData.name.trim() || !formData.medicationCode.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Name and medication code are required' });
      return;
    }
    updateMutation.mutate({ id: editingMedication.id, data: formData });
  };

  const handleDelete = (medication: Medication) => {
    Swal.fire({
      title: 'Delete Medication',
      text: `Are you sure you want to delete "${medication.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(medication.id);
      }
    });
  };

  const getStatusBadge = (medication: Medication) => {
    if (!medication.active) {
      return <Badge bg="secondary">Inactive</Badge>;
    }
    if (medication.controlledSubstance) {
      return <Badge bg="warning">Controlled</Badge>;
    }
    return <Badge bg="success">Active</Badge>;
  };

  // Show loading while permissions are being fetched
  if (permissionsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }
  
  // Restrict access - only users with MANAGE_MEDICATIONS permission can manage medications
  if (!canManageMedications) {
    return (
      <div className="container-fluid">
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You do not have permission to manage medications. Please contact your administrator.</p>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading medications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Medications</Alert.Heading>
        <p>Failed to load medications. Please try again.</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="medication-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Medication Management</h2>
          <p className="text-muted mb-0">Manage medications, categories, and pricing</p>
        </div>
        {canManageMedications && (
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Medication
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Medications</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, code, or manufacturer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
                    <i className="bi bi-x"></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filterActive === undefined ? '' : filterActive.toString()}
                  onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Controlled Substances</Form.Label>
                <Form.Select
                  value={filterControlled === undefined ? '' : filterControlled.toString()}
                  onChange={(e) => setFilterControlled(e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <option value="">All</option>
                  <option value="true">Controlled</option>
                  <option value="false">Non-Controlled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterActive(undefined);
                      setFilterControlled(undefined);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Medications Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Medications ({medications?.length || 0})</h5>
            <Button variant="outline-primary" size="sm" onClick={() => refetch()}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Dosage Form</th>
                  <th>Strength</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medications?.map((medication) => (
                  <tr key={medication.id}>
                    <td>
                      <code>{medication.medicationCode}</code>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{medication.name}</div>
                        {medication.manufacturer && (
                          <small className="text-muted">{medication.manufacturer}</small>
                        )}
                      </div>
                    </td>
                    <td>{medication.genericName || '-'}</td>
                    <td>
                      <Badge bg="info">
                        {DOSAGE_FORM_OPTIONS.find(opt => opt.value === medication.dosageForm)?.label || medication.dosageForm}
                      </Badge>
                    </td>
                    <td>{medication.strength || '-'}</td>
                    <td>{formatCurrency(medication.unitPrice || 0)}</td>
                    <td>{getStatusBadge(medication)}</td>
                    <td>
                      {canManageMedications ? (
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(medication)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(medication)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Medication Modal */}
      {canManageMedications && (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Medication Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.medicationCode}
                  onChange={(e) => setFormData({ ...formData, medicationCode: e.target.value })}
                  placeholder="e.g., MED001"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Generic Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g., Acetaminophen"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Manufacturer</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., Pfizer"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Dosage Form</Form.Label>
                <Form.Select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value as any })}
                >
                  {DOSAGE_FORM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Strength</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g., 500mg"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unit of Measure</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  placeholder="e.g., tablet"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Controlled Substance"
                checked={formData.controlledSubstance}
                onChange={(e) => setFormData({ ...formData, controlledSubstance: e.target.checked })}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Requires Prescription"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Create Medication'}
          </Button>
        </Modal.Footer>
      </Modal>
      )}

      {/* Edit Medication Modal */}
      {canManageMedications && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Medication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Medication Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.medicationCode}
                  onChange={(e) => setFormData({ ...formData, medicationCode: e.target.value })}
                  placeholder="e.g., MED001"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Generic Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g., Acetaminophen"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Manufacturer</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., Pfizer"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Dosage Form</Form.Label>
                <Form.Select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value as any })}
                >
                  {DOSAGE_FORM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Strength</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g., 500mg"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unit of Measure</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  placeholder="e.g., tablet"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Controlled Substance"
                checked={formData.controlledSubstance}
                onChange={(e) => setFormData({ ...formData, controlledSubstance: e.target.checked })}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Requires Prescription"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Update Medication'}
          </Button>
        </Modal.Footer>
      </Modal>
      )}
    </div>
  );
}
