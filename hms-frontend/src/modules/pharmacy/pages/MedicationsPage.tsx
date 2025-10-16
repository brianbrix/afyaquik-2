import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi, Medication, MedicationRequest, DOSAGE_FORM_OPTIONS } from '../../../services/pharmacyApi';
import { MedicationForm } from '../components/MedicationForm';
// Icons are used via CSS classes: bi-search, bi-plus, bi-pencil-square, bi-trash, bi-eye

export function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'controlled' | 'prescription'>('all');

  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, error } = useQuery({
    queryKey: ['medications', filter],
    queryFn: async () => {
      try {
        switch (filter) {
          case 'active':
            return await medicationApi.getAll({ active: true });
          case 'controlled':
            return await medicationApi.getAll({ controlled: true });
          case 'prescription':
            return await medicationApi.getAll({ requiresPrescription: true });
          default:
            return await medicationApi.getAll();
        }
      } catch (error) {
        console.error('Error fetching medications:', error);
        return [];
      }
    }
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['medications', 'search', searchTerm],
    queryFn: async () => {
      try {
        return await medicationApi.search(searchTerm);
      } catch (error) {
        console.error('Error searching medications:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2
  });

  const createMutation = useMutation({
    mutationFn: (data: MedicationRequest) => medicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicationRequest }) => 
      medicationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowForm(false);
      setEditingMedication(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowDeleteModal(false);
      setMedicationToDelete(null);
    }
  });

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = (data: MedicationRequest) => {
    if (editingMedication) {
      updateMutation.mutate({ id: editingMedication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMedication(null);
  };

  const displayMedications = searchTerm.length > 2 ? (searchResults || []) : (medications || []);

  if (error) {
    return (
      <Alert variant="danger">
        Error loading medications: {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2>Medications</h2>
        </Col>
      
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Medications</option>
                <option value="active">Active Only</option>
                <option value="controlled">Controlled Substances</option>
                <option value="prescription">Requires Prescription</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Dosage Form</th>
                  <th>Strength</th>
                  <th>Unit Price</th>
                  <th>Status</th>
               
                </tr>
              </thead>
              <tbody>
                {displayMedications.map((medication) => (
                  <tr key={medication.id}>
                    <td>{medication.medicationCode}</td>
                    <td>{medication.name}</td>
                    <td>{medication.genericName || '-'}</td>
                    <td>
                      {medication.dosageForm 
                        ? DOSAGE_FORM_OPTIONS.find(opt => opt.value === medication.dosageForm)?.label || medication.dosageForm
                        : '-'
                      }
                    </td>
                    <td>{medication.strength || '-'}</td>
                    <td>{medication.unitPrice ? `$${medication.unitPrice.toFixed(2)}` : '-'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {medication.active && <Badge bg="success">Active</Badge>}
                        {medication.controlledSubstance && <Badge bg="warning">Controlled</Badge>}
                        {medication.requiresPrescription && <Badge bg="info">Rx Required</Badge>}
                      </div>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showForm} onHide={handleFormClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MedicationForm
            medication={editingMedication}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the medication "{medicationToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => medicationToDelete && deleteMutation.mutate(medicationToDelete.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
