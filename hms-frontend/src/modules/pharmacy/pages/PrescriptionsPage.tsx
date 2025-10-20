import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Table, Badge, Modal, Alert, Tab, Tabs } from 'react-bootstrap';
import { Pagination as Pager } from '../../../components/shared/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionApi, Prescription, PrescriptionRequest } from '../../../services/pharmacyApi';
import { PrescriptionForm } from '../components/PrescriptionForm';
import { PrescriptionAuditTrail } from '../../../components/pharmacy/PrescriptionAuditTrail';
import { useAuth } from '../../../hooks/useAuth';
import Swal from 'sweetalert2';
// Icons are used via CSS classes: bi-search, bi-plus, bi-pencil-square, bi-trash, bi-check-circle, bi-x-circle, bi-eye

export function PrescriptionsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [prescriptionToDispense, setPrescriptionToDispense] = useState<Prescription | null>(null);
  const [dispenseNotes, setDispenseNotes] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedPrescriptionForAudit, setSelectedPrescriptionForAudit] = useState<Prescription | null>(null);

  const queryClient = useQueryClient();

  const { data: prescPage, isLoading, error } = useQuery({
    queryKey: ['prescriptions','paged', activeTab, searchTerm, page, size],
    queryFn: async () => {
      try {
        if (searchTerm.trim().length > 2) {
          return await prescriptionApi.searchPaged(searchTerm.trim(), page, size);
        }
        switch (activeTab) {
          case 'pending':
            return await prescriptionApi.getAllPaged(page, size, { status: 'PENDING' });
          case 'dispensed':
            return await prescriptionApi.getAllPaged(page, size, { status: 'DISPENSED' });
          case 'cancelled':
            return await prescriptionApi.getAllPaged(page, size, { status: 'CANCELLED' });
          default:
            return await prescriptionApi.getAllPaged(page, size);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return { content: [], totalElements: 0, totalPages: 0, size, number: page } as any;
      }
    }
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['prescriptions', 'search', searchTerm],
    queryFn: async () => {
      try {
        return await prescriptionApi.search(searchTerm);
      } catch (error) {
        console.error('Error searching prescriptions:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2
  });

  const createMutation = useMutation({
    mutationFn: (data: PrescriptionRequest) => prescriptionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setShowForm(false);
    }
  });

  const dispenseMutation = useMutation({
    mutationFn: ({ id, dispensedBy, notes }: { id: number; dispensedBy: number; notes?: string }) =>
      prescriptionApi.dispense(id, dispensedBy, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setShowDispenseModal(false);
      setPrescriptionToDispense(null);
      setDispenseNotes('');
    },
    onError: (error: any) => {
      console.error('Failed to dispense prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to dispense prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => prescriptionApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error: any) => {
      console.error('Failed to cancel prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to cancel prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => prescriptionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setShowDeleteModal(false);
      setPrescriptionToDelete(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to delete prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  });

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  const handleDelete = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteModal(true);
  };

  const handleDispense = (prescription: Prescription) => {
    setPrescriptionToDispense(prescription);
    setShowDispenseModal(true);
  };

  const handleCancel = (prescription: Prescription) => {
    if (window.confirm('Are you sure you want to cancel this prescription?')) {
      cancelMutation.mutate(prescription.id);
    }
  };

  const handleFormSubmit = (data: PrescriptionRequest) => {
    if (editingPrescription) {
      // Update not implemented in this example
      console.log('Update prescription:', data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPrescription(null);
  };

  const handleDispenseSubmit = () => {
    if (prescriptionToDispense) {
      // Get current user ID from auth context
      const dispensedBy = user?.id || 1;
      dispenseMutation.mutate({
        id: prescriptionToDispense.id,
        dispensedBy,
        notes: dispenseNotes || undefined
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Pending</Badge>;
      case 'DISPENSED':
        return <Badge bg="success">Dispensed</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'EXPIRED':
        return <Badge bg="secondary">Expired</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const displayPrescriptions = (prescPage?.content ?? []) as Prescription[];

  if (error) {
    return (
      <Alert variant="danger">
        Error loading prescriptions: {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2>Prescriptions</h2>
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
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'all')}
            className="mb-3"
          >
            <Tab eventKey="all" title="All Prescriptions">
              <PrescriptionTable
                prescriptions={displayPrescriptions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDispense={handleDispense}
                onCancel={handleCancel}
                onViewAuditTrail={(prescription) => {
                  setSelectedPrescriptionForAudit(prescription);
                  setShowAuditTrail(true);
                }}
                getStatusBadge={getStatusBadge}
              />
              <div className="d-flex justify-content-end mt-3">
                <Pager
                  page={page}
                  size={size}
                  totalElements={prescPage?.totalElements ?? 0}
                  totalPages={prescPage?.totalPages ?? 0}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setSize(s); setPage(0); }}
                />
              </div>
            </Tab>
            <Tab eventKey="pending" title="Pending">
              <PrescriptionTable
                prescriptions={displayPrescriptions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDispense={handleDispense}
                onCancel={handleCancel}
                onViewAuditTrail={(prescription) => {
                  setSelectedPrescriptionForAudit(prescription);
                  setShowAuditTrail(true);
                }}
                getStatusBadge={getStatusBadge}
              />
            </Tab>
            <Tab eventKey="dispensed" title="Dispensed">
              <PrescriptionTable
                prescriptions={displayPrescriptions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDispense={handleDispense}
                onCancel={handleCancel}
                onViewAuditTrail={(prescription) => {
                  setSelectedPrescriptionForAudit(prescription);
                  setShowAuditTrail(true);
                }}
                getStatusBadge={getStatusBadge}
              />
            </Tab>
            <Tab eventKey="cancelled" title="Cancelled">
              <PrescriptionTable
                prescriptions={displayPrescriptions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDispense={handleDispense}
                onCancel={handleCancel}
                onViewAuditTrail={(prescription) => {
                  setSelectedPrescriptionForAudit(prescription);
                  setShowAuditTrail(true);
                }}
                getStatusBadge={getStatusBadge}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <Modal show={showForm} onHide={handleFormClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPrescription ? 'Edit Prescription' : 'New Prescription'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PrescriptionForm
            prescription={editingPrescription}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            isLoading={createMutation.isPending}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDispenseModal} onHide={() => setShowDispenseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dispense Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Prescription Number</Form.Label>
              <Form.Control
                type="text"
                value={prescriptionToDispense?.prescriptionNumber || ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Control
                type="text"
                value={prescriptionToDispense?.patientName || ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dispensing Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={dispenseNotes}
                onChange={(e) => setDispenseNotes(e.target.value)}
                placeholder="Any notes about the dispensing..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDispenseModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleDispenseSubmit}
            disabled={dispenseMutation.isPending}
          >
            {dispenseMutation.isPending ? 'Dispensing...' : 'Dispense'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete prescription "{prescriptionToDelete?.prescriptionNumber}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => prescriptionToDelete && deleteMutation.mutate(prescriptionToDelete.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Audit Trail Modal */}
      {selectedPrescriptionForAudit && (
        <PrescriptionAuditTrail
          show={showAuditTrail}
          onHide={() => {
            setShowAuditTrail(false);
            setSelectedPrescriptionForAudit(null);
          }}
          prescriptionId={selectedPrescriptionForAudit.id}
          prescriptionNumber={selectedPrescriptionForAudit.prescriptionNumber}
        />
      )}
    </div>
  );
}

interface PrescriptionTableProps {
  prescriptions: Prescription[];
  isLoading: boolean;
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescription: Prescription) => void;
  onDispense: (prescription: Prescription) => void;
  onCancel: (prescription: Prescription) => void;
  onViewAuditTrail: (prescription: Prescription) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

function PrescriptionTable({ 
  prescriptions, 
  isLoading, 
  onEdit, 
  onDelete, 
  onDispense, 
  onCancel, 
  onViewAuditTrail,
  getStatusBadge 
}: PrescriptionTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Table responsive striped hover>
      <thead>
        <tr>
          <th>Prescription #</th>
          <th>Patient</th>
          <th>MRN</th>
          <th>Prescribed By</th>
          <th>Date</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Version</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {prescriptions.map((prescription) => (
          <tr key={prescription.id}>
            <td>{prescription.prescriptionNumber}</td>
            <td>{prescription.patientName}</td>
            <td>{prescription.patientMrn}</td>
            <td>{prescription.prescribedByName}</td>
            <td>{new Date(prescription.prescriptionDate).toLocaleDateString()}</td>
            <td>{prescription.totalAmount ? `$${prescription.totalAmount.toFixed(2)}` : '-'}</td>
            <td>{getStatusBadge(prescription.status)}</td>
            <td>
              <Badge bg="secondary">v{prescription.version}</Badge>
            </td>
            <td>
              <div className="d-flex gap-1">
                {prescription.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => onDispense(prescription)}
                    >
                      <i className="bi bi-check-circle"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onCancel(prescription)}
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(prescription)}
                  disabled={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED'}
                  title={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED' 
                    ? 'Cannot edit dispensed prescription' 
                    : 'View/Edit prescription'}
                >
                  <i className="bi bi-eye"></i>
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => onViewAuditTrail(prescription)}
                  title="View audit trail"
                >
                  <i className="bi bi-clock-history"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(prescription)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
