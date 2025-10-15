import React, { useState, useEffect } from 'react';
import { fetchConsultationTitles, ConsultationTitleDto } from '../../services/consultationTitlesApi';
import { testCatalogApi, diagnosticOrderApi } from '../../services/diagnosticsApi';
import { medicationApi, queuePrescriptionApi, prescriptionApi, type Medication } from '../../services/pharmacyApi';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup, Modal, Card, Badge, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

export interface ConsultationItem {
  id: number;
  title: string;
  details: string;
  isCustom: boolean;
}

interface ConsultationActionsSectionProps {
  initialItems?: ConsultationItem[];
  onChange?: (items: ConsultationItem[]) => void;
  onSubmit?: (items: ConsultationItem[]) => void | Promise<void>;
  loading?: boolean;
  queueItemId?: number;
  patientId?: number;
}

export const ConsultationActionsSection: React.FC<ConsultationActionsSectionProps> = ({ 
  initialItems = [], 
  onChange, 
  onSubmit, 
  loading,
  queueItemId,
  patientId
}) => {
  const [items, setItems] = useState<ConsultationItem[]>(initialItems);
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [consultationTitles, setConsultationTitles] = useState<ConsultationTitleDto[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(true);
  
  // Diagnostic order state
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [urgency, setUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Edit order state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editClinicalNotes, setEditClinicalNotes] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editUrgency, setEditUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Prescription state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Partial<any>>({});
  const [stockLevels, setStockLevels] = useState<Record<number, number>>({});
  
  const { user } = useAuth();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setLoadingTitles(true);
    fetchConsultationTitles().then(titles => {
      setConsultationTitles(titles);
      setLoadingTitles(false);
    });
  }, []);

  // Fetch available diagnostic tests
  const { data: availableTests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['diagnostic-tests'],
    queryFn: () => testCatalogApi.getAll({ active: true }),
  });

  // Fetch existing diagnostic orders for this queue item
  const { data: existingOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['diagnostic-orders', queueItemId],
    queryFn: () => diagnosticOrderApi.getByQueueItem(queueItemId!),
    enabled: !!queueItemId,
  });

  // Fetch medications for prescription
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => medicationApi.getAll(),
  });

  // Fetch existing prescriptions for this queue item
  const { data: existingPrescriptions = [], isLoading: prescriptionsLoading, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['queue-prescriptions', queueItemId],
    queryFn: () => queuePrescriptionApi.getByQueueItem(queueItemId!),
    enabled: !!queueItemId,
  });

  const handleAddItem = (title: string, isCustom = false) => {
    if (!title.trim()) return;
    
    // Check for duplicate titles
    const trimmedTitle = title.trim();
    const existingTitles = items.map(item => item.title.toLowerCase());
    
    if (existingTitles.includes(trimmedTitle.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Title',
        text: `A consultation item with the title "${trimmedTitle}" already exists. Please choose a different title.`,
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const newItem: ConsultationItem = {
      id: Date.now() + Math.random(),
      title: trimmedTitle,
      details: '',
      isCustom
    };
    const updated = [...items, newItem];
    setItems(updated);
    onChange?.(updated);
    setCustomTitle('');
  };

  const handleRemoveItem = (id: number) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onChange?.(updated);
  };

  const handleDetailsChange = (id: number, details: string) => {
    const updated = items.map(i => i.id === id ? { ...i, details } : i);
    setItems(updated);
    onChange?.(updated);
  };

  const handleCreateDiagnosticOrder = async () => {
    if (selectedTests.length === 0) {
      Swal.fire('Error', 'Please select at least one test', 'error');
      return;
    }

    try {
      // Create diagnostic order
      const orderData = {
        patientId: patientId!,
        queueItemId: queueItemId!,
        clinicalNotes: clinicalNotes + (instructions ? `\n\nInstructions: ${instructions}` : ''),
        urgency,
        diagnosticItems: selectedTests.map((testId, index) => {
          const test = availableTests.find(t => t.id === testId);
          return {
            id: Date.now() + index, // Temporary ID for new items
            testCatalogId: testId,
            testCode: test?.testCode || '',
            testName: test?.testName || '',
            testType: test?.testType || '',
            department: test?.department || '',
            status: 'PENDING',
            cost: test?.cost || 0
          };
        })
      };

      await diagnosticOrderApi.create(orderData);
      
      // Refetch orders to show the new one
      refetchOrders();
      
      Swal.fire('Success', 'Diagnostic order created successfully', 'success');
      setShowDiagnosticModal(false);
      setSelectedTests([]);
      setClinicalNotes('');
      setInstructions('');
      setUrgency('ROUTINE');
    } catch (error) {
      console.error('Failed to create diagnostic order:', error);
      Swal.fire('Error', 'Failed to create diagnostic order', 'error');
    }
  };

  const handleTestSelection = (testId: number, checked: boolean) => {
    if (checked) {
      setSelectedTests(prev => [...prev, testId]);
    } else {
      setSelectedTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handleEditOrder = (order: any) => {
    if (order.status !== 'ORDERED') {
      Swal.fire('Error', 'Only orders with ORDERED status can be edited', 'error');
      return;
    }
    setSelectedOrder(order);
    setEditClinicalNotes(order.clinicalNotes || '');
    setEditInstructions('');
    setEditUrgency(order.urgency || 'ROUTINE');
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const updatedOrder = {
        ...selectedOrder,
        clinicalNotes: editClinicalNotes + (editInstructions ? `\n\nInstructions: ${editInstructions}` : ''),
        urgency: editUrgency
      };

      await diagnosticOrderApi.update(selectedOrder.id, updatedOrder);
      refetchOrders();
      setShowEditModal(false);
      setSelectedOrder(null);
      Swal.fire('Success', 'Order updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update order:', error);
      Swal.fire('Error', 'Failed to update order', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this diagnostic order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        await diagnosticOrderApi.updateStatus(orderId, 'CANCELLED');
        refetchOrders();
        Swal.fire('Success', 'Order cancelled successfully', 'success');
      } catch (error) {
        console.error('Failed to cancel order:', error);
        Swal.fire('Error', 'Failed to cancel order', 'error');
      }
    }
  };

  // Prescription functions
  const handleAddPrescription = () => {
    setCurrentPrescription({
      medicationId: undefined,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    });
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async () => {
    if (!currentPrescription.medicationId || !patientId || !user?.id) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const prescriptionRequest = {
        patientId: patientId,
        prescribedById: user.id,
        notes: currentPrescription.instructions || '',
        items: [{
          medicationId: currentPrescription.medicationId,
          quantityPrescribed: currentPrescription.quantity || 1,
          dosageInstructions: currentPrescription.dosage || '',
          frequency: currentPrescription.frequency || '',
          durationDays: currentPrescription.duration ? parseInt(currentPrescription.duration) : undefined,
          unitPrice: undefined, // Will be set by backend from medication price
          notes: currentPrescription.instructions || ''
        }]
      };

      await queuePrescriptionApi.createForQueueItem(queueItemId!, prescriptionRequest);
      await refetchPrescriptions();
      setShowPrescriptionModal(false);
      setCurrentPrescription({});
      Swal.fire('Success', 'Prescription created successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to create prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrescription = (prescription: any) => {
    setCurrentPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleUpdatePrescription = async () => {
    if (!currentPrescription.id || !currentPrescription.medicationId) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const updateRequest = {
        prescriptionNumber: currentPrescription.prescriptionNumber || `RX-${Date.now()}`,
        patientId: patientId!,
        prescribedById: user?.id || 1,
        prescriptionDate: currentPrescription.prescribedAt,
        notes: currentPrescription.instructions || '',
        items: [{
          medicationId: currentPrescription.medicationId,
          quantityPrescribed: currentPrescription.quantity || 1,
          dosageInstructions: currentPrescription.dosage || '',
          frequency: currentPrescription.frequency || '',
          durationDays: currentPrescription.duration ? parseInt(currentPrescription.duration) : undefined,
          unitPrice: currentPrescription.unitPrice || undefined,
          notes: currentPrescription.instructions || ''
        }]
      };

      await prescriptionApi.update(currentPrescription.id, updateRequest);
      await refetchPrescriptions();
      setShowPrescriptionModal(false);
      setCurrentPrescription({});
      Swal.fire('Success', 'Prescription updated successfully', 'success');
    } catch (error: any) {
      console.error('Failed to update prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to update prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePrescription = async (prescriptionId: number) => {
    const result = await Swal.fire({
      title: 'Remove Prescription?',
      text: 'Are you sure you want to remove this prescription?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await prescriptionApi.delete(prescriptionId);
        await refetchPrescriptions();
        Swal.fire('Success', 'Prescription removed successfully', 'success');
      } catch (error: any) {
        console.error('Failed to remove prescription:', error);
        
        // Extract error message from backend response
        let errorMessage = 'Failed to remove prescription';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReplacePrescription = async (prescription: any) => {
    const isDispensed = prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED';
    
    const result = await Swal.fire({
      title: 'Replace Prescription',
      html: `
        <div>
          <p>Are you sure you want to replace prescription <strong>${prescription.prescriptionNumber}</strong>?</p>
          ${isDispensed ? `
            <div class="alert alert-warning">
              <strong>Warning:</strong> This prescription has been dispensed. 
              Replacing it will:
              <ul class="mb-0 mt-2">
                <li>Create a new prescription</li>
                <li>Mark the current one as replaced</li>
                <li><strong>Mark billing items as VOIDED (acts like a discount)</strong></li>
                <li>Bill items will remain visible but with negative amounts</li>
              </ul>
            </div>
          ` : `
            <p>This will create a new prescription and mark the current one as replaced.</p>
          `}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isDispensed ? 'Yes, replace and reverse billing!' : 'Yes, replace it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        
        // Create a new prescription with the same details
        // Extract the first item from the prescription items array
        const originalItem = prescription.items && prescription.items.length > 0 ? prescription.items[0] : null;
        
        if (!originalItem) {
          throw new Error('No prescription items found to replace');
        }

        const replacementRequest = {
          patientId: patientId!,
          prescribedById: user?.id || 1,
          notes: `Replacement for prescription ${prescription.prescriptionNumber}. Original: ${originalItem.dosageInstructions || 'No instructions'}`,
          items: [{
            medicationId: originalItem.medicationId,
            quantityPrescribed: originalItem.quantityPrescribed,
            dosageInstructions: originalItem.dosageInstructions,
            frequency: originalItem.frequency,
            durationDays: originalItem.durationDays,
            unitPrice: originalItem.unitPrice || undefined,
            notes: originalItem.notes
          }]
        };

        // Create the replacement prescription
        console.log('Creating replacement prescription...', replacementRequest);
        const replacementPrescription = await queuePrescriptionApi.createForQueueItem(queueItemId!, replacementRequest);
        console.log('Replacement prescription created:', replacementPrescription);
        
        // Mark the original prescription as replaced (this will handle billing reversal if dispensed)
        if (!user?.id) {
          throw new Error('User ID not available. Please refresh the page and try again.');
        }
        console.log('Marking original prescription as replaced...', prescription.id, replacementPrescription.id);
        await prescriptionApi.replace(prescription.id, replacementPrescription.id, user.id, 
          isDispensed ? 'Prescription replaced by doctor - billing reversed' : 'Prescription replaced by doctor');
        console.log('Original prescription marked as replaced');
        
        // Refetch prescriptions to get updated data
        await refetchPrescriptions();
        
        Swal.fire({
          title: 'Success', 
          text: isDispensed 
            ? 'Prescription replaced successfully. Billing items have been marked as VOIDED and will act like discounts.' 
            : 'Prescription replaced successfully',
          icon: 'success'
        });
      } catch (error: any) {
        console.error('Failed to replace prescription:', error);
        
        // Extract error message from backend response
        let errorMessage = 'Failed to replace prescription';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="mb-2">
      <div className="fw-semibold mb-2">Consultation Actions</div>
      <Form.Group as={Row} className="mb-2 align-items-center">
        <Col sm={6}>
          <Form.Select 
            onChange={e => {
              const selectedTitle = e.target.value;
              if (selectedTitle) {
                handleAddItem(selectedTitle);
                e.target.value = ""; // Reset selection
              }
            }} 
            defaultValue="" 
            disabled={loadingTitles}
          >
            <option value="">Add from configured titles...</option>
            {consultationTitles
              .filter(t => !items.some(item => item.title.toLowerCase() === t.title.toLowerCase()))
              .map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
          </Form.Select>
        </Col>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Custom title..."
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
            />
            <Button 
              variant="outline-primary" 
              onClick={() => handleAddItem(customTitle, true)} 
              disabled={!customTitle.trim() || items.some(item => item.title.toLowerCase() === customTitle.trim().toLowerCase())}
            >
              Add Custom
            </Button>
          </InputGroup>
        </Col>
      </Form.Group>
      {items.length === 0 && <div className="text-muted small mb-2">No consultation items added yet.</div>}
      {items.map((item, idx) => (
        <div key={item.id} className="border rounded p-2 mb-2 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold">{item.title}</span>
            <Button size="sm" variant="outline-danger" onClick={() => handleRemoveItem(item.id)}>
              Remove
            </Button>
          </div>
          <RichTextEditor
            theme="snow"
            value={item.details}
            onChange={val => handleDetailsChange(item.id, val)}
            placeholder="Enter details..."
            style={{ background: 'white' }}
          />
        </div>
      ))}
      
      {/* Diagnostic Orders Section */}
      <div className="border-top pt-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Diagnostic Orders</span>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowDiagnosticModal(true)}
            disabled={!queueItemId || !patientId}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Order Diagnostics
          </Button>
        </div>
        <div className="text-muted small mb-3">
          Order diagnostic tests for this patient during consultation
        </div>
        
        {/* Existing Diagnostic Orders */}
        {ordersLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm me-2"></div>
            Loading diagnostic orders...
          </div>
        ) : existingOrders.length > 0 ? (
          <div className="mb-3">
            {existingOrders.map((order) => (
              <Card key={order.id} className="mb-2">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold">{order.orderNumber}</span>
                        <Badge bg={order.status === 'ORDERED' ? 'warning' : order.status === 'IN_PROGRESS' ? 'info' : order.status === 'COMPLETED' ? 'success' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <Badge bg={order.urgency === 'EMERGENCY' ? 'danger' : order.urgency === 'STAT' ? 'warning' : 'secondary'}>
                          {order.urgency}
                        </Badge>
                      </div>
                      <div className="text-muted small mb-2">
                        {order.diagnosticItems?.length || 0} test(s) • Ordered by {order.orderedByName} • {new Date(order.orderedAt).toLocaleString()}
                      </div>
                      {order.clinicalNotes && (
                        <div className="text-muted small">
                          <strong>Notes:</strong> {order.clinicalNotes}
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      {order.status === 'ORDERED' && (
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => handleEditOrder(order)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                      )}
                      {order.status === 'ORDERED' && (
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted small mb-3">
            No diagnostic orders created yet
          </div>
        )}
      </div>

      {/* Prescriptions Section */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Prescriptions</h6>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleAddPrescription}
            disabled={submitting}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Prescription
          </Button>
        </div>
        
        {existingPrescriptions.length > 0 ? (
          <Table responsive size="sm" hover>
            <thead>
              <tr>
                <th>Prescription #</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>
                    <div className="fw-semibold">{prescription.prescriptionNumber}</div>
                    <small className="text-muted">
                      {new Date(prescription.prescriptionDate).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {prescription.items?.map((item: any) => item.medicationName).join(', ')}
                  </td>
                  <td>{prescription.items?.[0]?.dosageInstructions}</td>
                  <td>{prescription.items?.[0]?.frequency}</td>
                  <td>
                    {prescription.items?.[0]?.durationDays ? `${prescription.items[0].durationDays} days` : '—'}
                  </td>
                  <td>
                    <Badge bg={prescription.status === 'PENDING' ? 'warning' : 'success'}>
                      {prescription.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleEditPrescription(prescription)}
                        disabled={submitting || prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED'}
                        title={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED' ? 'Cannot edit dispensed prescription' : 'Edit prescription'}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => handleReplacePrescription(prescription)}
                        disabled={submitting}
                        title="Replace prescription"
                      >
                        <i className="bi bi-arrow-repeat"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleRemovePrescription(prescription.id)}
                        disabled={submitting || prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED'}
                        title={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED' ? 'Cannot delete dispensed prescription' : 'Delete prescription'}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-muted small mb-3">
            No prescriptions created yet
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="primary"
          onClick={async () => {
            if (!onSubmit) return;
            setSubmitting(true);
            await onSubmit(items);
            setSubmitting(false);
          }}
          disabled={submitting || loading}
        >
          {submitting || loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
      
      {/* Diagnostic Order Modal */}
      <Modal show={showDiagnosticModal} onHide={() => setShowDiagnosticModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Diagnostic Tests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Urgency</Form.Label>
                  <Form.Select value={urgency} onChange={(e) => setUrgency(e.target.value as any)}>
                    <option value="ROUTINE">Routine</option>
                    <option value="STAT">Stat</option>
                    <option value="EMERGENCY">Emergency</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Selected Tests ({selectedTests.length})</Form.Label>
                  <div className="text-muted small">
                    {selectedTests.length > 0 ? `${selectedTests.length} test(s) selected` : 'No tests selected'}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Clinical Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter clinical notes for the diagnostic order..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special instructions for the diagnostic tests..."
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Available Tests</Form.Label>
              {testsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading tests...
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableTests.map((test) => (
                    <Card key={test.id} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{test.testName}</div>
                            <div className="text-muted small">
                              {test.testType} • {test.department} • KSh {test.cost}
                            </div>
                          </div>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={(e) => handleTestSelection(test.id, e.target.checked)}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  {availableTests.length === 0 && (
                    <div className="text-center py-3 text-muted">
                      No diagnostic tests available
                    </div>
                  )}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiagnosticModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateDiagnosticOrder}
            disabled={selectedTests.length === 0}
          >
            Create Diagnostic Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Order Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Diagnostic Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Order Number</Form.Label>
                    <Form.Control value={selectedOrder.orderNumber} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Urgency</Form.Label>
                    <Form.Select value={editUrgency} onChange={(e) => setEditUrgency(e.target.value as any)}>
                      <option value="ROUTINE">Routine</option>
                      <option value="STAT">Stat</option>
                      <option value="EMERGENCY">Emergency</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Clinical Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editClinicalNotes}
                  onChange={(e) => setEditClinicalNotes(e.target.value)}
                  placeholder="Enter clinical notes..."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Additional Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Enter additional instructions..."
                />
              </Form.Group>
              
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> You can only edit clinical notes, instructions, and urgency level. Test selection cannot be modified.
              </Alert>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateOrder}>
            Update Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPrescription.id ? 'Edit Prescription' : 'Add Prescription'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Medication *</Form.Label>
                  <Form.Select
                    value={currentPrescription.medicationId || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      medicationId: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                  >
                    <option value="">Select medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.medicationCode || med.id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPrescription.quantity || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      quantity: Number(e.target.value) 
                    }))}
                    placeholder="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dosage</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPrescription.dosage || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      dosage: e.target.value 
                    }))}
                    placeholder="e.g., 500mg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Frequency</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPrescription.frequency || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      frequency: e.target.value 
                    }))}
                    placeholder="e.g., Twice daily"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration (days)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPrescription.duration || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      duration: e.target.value 
                    }))}
                    placeholder="7"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentPrescription.instructions || ''}
                onChange={(e) => setCurrentPrescription(prev => ({ 
                  ...prev, 
                  instructions: e.target.value 
                }))}
                placeholder="Enter prescription instructions..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={currentPrescription.id ? handleUpdatePrescription : handleSavePrescription}
            disabled={submitting || !currentPrescription.medicationId}
          >
            {submitting ? 'Saving...' : (currentPrescription.id ? 'Update Prescription' : 'Create Prescription')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
