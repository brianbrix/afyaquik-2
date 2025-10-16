import React, { useState, useEffect } from 'react';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup, Card, Badge, Modal, Table } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi, prescriptionApi, queuePrescriptionApi, inventoryApi, type Medication } from '../../services/pharmacyApi';
import { fetchPharmacyActions, bulkUpsertPharmacyActions } from '../../services/pharmacyActionsApi';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

interface PharmacyItem {
  id: number;
  title: string;
  details: string;
  isCustom: boolean;
  category: 'medication' | 'prescription' | 'inventory' | 'other';
}

interface PrescriptionItem {
  id: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  prescribedQuantity: number; // Original prescribed quantity
  dispensedQuantity: number; // How much has been dispensed
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED' | 'CANCELLED' | 'REPLACED';
  prescribedAt: string;
  dispensedAt?: string;
  prescriptionNumber?: string;
  unitPrice?: number;
}

interface PharmacyActionsSectionProps {
  initialItems?: PharmacyItem[];
  onChange?: (items: PharmacyItem[]) => void;
  onSubmit?: (items: PharmacyItem[]) => void | Promise<void>;
  loading?: boolean;
  queueItemId?: number; // Add queue item ID for prescription association
  patientId?: number; // Add patient ID for prescription association
  isReadonly?: boolean;
}

const PHARMACY_TITLES = [
  { title: 'Medication Dispensed', category: 'medication' },
  { title: 'Prescription Filled', category: 'prescription' },
  { title: 'Inventory Check', category: 'inventory' },
  { title: 'Drug Interaction Check', category: 'medication' },
  { title: 'Allergy Verification', category: 'medication' },
  { title: 'Dosage Calculation', category: 'medication' },
  { title: 'Controlled Substance Log', category: 'inventory' },
  { title: 'Patient Counseling', category: 'other' },
  { title: 'Insurance Verification', category: 'other' },
  { title: 'Prior Authorization', category: 'other' },
  { title: 'Medication Reconciliation', category: 'medication' },
  { title: 'Adverse Drug Reaction', category: 'medication' },
  { title: 'Therapeutic Drug Monitoring', category: 'medication' },
  { title: 'Pharmacy Consultation', category: 'other' },
  { title: 'Medication Storage Check', category: 'inventory' }
];

const CATEGORY_COLORS = {
  medication: 'primary',
  prescription: 'success',
  inventory: 'warning',
  other: 'secondary'
};

export const PharmacyActionsSection: React.FC<PharmacyActionsSectionProps> = ({
  initialItems = [], 
  onChange, 
  onSubmit, 
  loading,
  queueItemId,
  patientId,
  isReadonly = false
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PharmacyItem['category']>('medication');
  const [submitting, setSubmitting] = useState(false);
  
  // Prescription state
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<number[]>([]);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseQuantities, setDispenseQuantities] = useState<Record<number, number>>({});
  
  // Prescription creation state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationId: 0,
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1
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

  // Fetch existing pharmacy actions for this queue item (for initial load only)
  const { data: existingPharmacyActions = [], isLoading: pharmacyActionsLoading } = useQuery({
    queryKey: ['pharmacy-actions', queueItemId],
    queryFn: () => fetchPharmacyActions(queueItemId!),
    enabled: !!queueItemId,
  });

  const queryClient = useQueryClient();

  // Only bulk upsert mutation is needed for saving all items at once

  const bulkUpsertMutation = useMutation({
    mutationFn: (actions: any[]) => bulkUpsertPharmacyActions(queueItemId!, actions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-actions', queueItemId] });
    }
  });

  // Transform existing prescriptions to the format expected by the component
  React.useEffect(() => {
    if (existingPrescriptions && existingPrescriptions.length > 0) {
      const transformedPrescriptions: PrescriptionItem[] = existingPrescriptions.map((prescription: any) => 
        prescription.items.map((item: any) => ({
          id: prescription.id,
          medicationId: item.medicationId,
          medicationName: item.medicationName || 'Unknown Medication',
          dosage: item.dosageInstructions || '',
          frequency: item.frequency || '',
          duration: `${item.durationDays || 0} days`,
          instructions: item.notes || '',
          quantity: item.quantityPrescribed,
          prescribedQuantity: item.quantityPrescribed,
          dispensedQuantity: item.quantityDispensed || 0,
          status: (prescription.status === 'DISPENSED' ? 'FULLY_DISPENSED' : 
                  prescription.status === 'PARTIALLY_DISPENSED' ? 'PARTIALLY_DISPENSED' : 
                  prescription.status === 'REPLACED' ? 'REPLACED' : 'PENDING') as 'PENDING' | 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED' | 'CANCELLED' | 'REPLACED',
          prescribedAt: prescription.prescriptionDate,
          dispensedAt: prescription.dispensedAt,
          prescriptionNumber: prescription.prescriptionNumber,
          unitPrice: item.unitPrice
        }))
      ).flat();
      setPrescriptions(transformedPrescriptions);
    } else {
      setPrescriptions([]);
    }
  }, [existingPrescriptions]);

  // Load existing pharmacy actions only once on mount
  React.useEffect(() => {
    if (existingPharmacyActions && existingPharmacyActions.length > 0 && items.length === 0) {
      const transformedActions: PharmacyItem[] = existingPharmacyActions.map((action: any) => ({
        id: action.id,
        title: action.title,
        details: action.details,
        isCustom: action.isCustom || false,
        category: action.category as PharmacyItem['category']
      }));
      setItems(transformedActions);
    }
  }, [existingPharmacyActions]); // Only run when existingPharmacyActions changes

  // Note: Pharmacy actions are now managed locally like Triage
  // They are only saved to backend when user clicks "Submit Pharmacy Actions"
  // This allows users to add/edit/remove items before committing to backend

  const handleAddItem = (title: string, category: PharmacyItem['category'] = 'medication', isCustom = false) => {
    if (!title.trim()) return;
    
    // Check for duplicate titles
    const trimmedTitle = title.trim();
    const existingTitles = items.map(item => item.title.toLowerCase());
    
    if (existingTitles.includes(trimmedTitle.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Title',
        text: `A pharmacy action with the title "${trimmedTitle}" already exists. Please choose a different title.`,
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const newItem: PharmacyItem = {
      id: Date.now() + Math.random(),
      title: trimmedTitle,
      details: '',
      isCustom,
      category
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

  const handleSelectPrescription = (id: number, selected: boolean) => {
    setSelectedPrescriptions(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(pId => pId !== id)
    );
  };

  const handleSelectAllPrescriptions = (selected: boolean) => {
    setSelectedPrescriptions(selected ? prescriptions.map(p => p.id) : []);
  };

  const handleDispenseRemaining = async (prescriptionId: number, remaining: number) => {
    try {
      setSubmitting(true);
      
      // Dispense the remaining quantity
      await prescriptionApi.dispense(prescriptionId, user?.id || 1, `Dispensed remaining ${remaining} units`);
      
      // Update local state
      setPrescriptions(prev => prev.map(p => {
        if (p.id === prescriptionId) {
          const newDispensedQty = (p.dispensedQuantity || 0) + remaining;
          const totalPrescribed = p.prescribedQuantity || p.quantity;
          const status = newDispensedQty >= totalPrescribed ? 'FULLY_DISPENSED' : 'PARTIALLY_DISPENSED';
          
          return {
            ...p,
            dispensedQuantity: newDispensedQty,
            status,
            dispensedAt: new Date().toISOString()
          };
        }
        return p;
      }));

      // Refetch prescriptions to get updated data
      refetchPrescriptions();
      
      Swal.fire('Success', 'Medication dispensed successfully', 'success');
    } catch (error: any) {
      console.error('Failed to dispense medication:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to dispense medication';
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

  const handleDispense = async () => {
    try {
      setSubmitting(true);
      
      // Dispense each selected prescription
      for (const prescriptionId of selectedPrescriptions) {
        await prescriptionApi.dispense(prescriptionId, user?.id || 1, 'Dispensed from pharmacy actions');
      }

      // Update local state
      setPrescriptions(prev => prev.map(p => {
        if (selectedPrescriptions.includes(p.id)) {
          const dispenseQty = dispenseQuantities[p.id] || 0;
          const newDispensedQty = (p.dispensedQuantity || 0) + dispenseQty;
          const totalPrescribed = p.prescribedQuantity || p.quantity;
          const status = newDispensedQty >= totalPrescribed ? 'FULLY_DISPENSED' : 
                        newDispensedQty > 0 ? 'PARTIALLY_DISPENSED' : 'PENDING';
          
          return {
            ...p,
            dispensedQuantity: newDispensedQty,
            status,
            dispensedAt: new Date().toISOString()
          };
        }
        return p;
      }));

      setSelectedPrescriptions([]);
      setDispenseQuantities({});
      setShowDispenseModal(false);
      
      // Refetch prescriptions to get updated data
      refetchPrescriptions();
      
      Swal.fire('Success', 'Medications dispensed successfully', 'success');
    } catch (error: any) {
      console.error('Failed to dispense medications:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to dispense medications';
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

  const handleCreatePrescription = async () => {
    if (!newPrescription.medicationId || !queueItemId || !patientId) {
      Swal.fire('Error', 'Please select a medication and ensure patient and queue item are available', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const prescriptionData = {
        prescriptionNumber: `PRES-${Date.now()}`,
        patientId,
        prescribedById: user?.id || 1,
        prescriptionDate: new Date().toISOString(),
        notes: newPrescription.instructions,
        items: [{
          medicationId: newPrescription.medicationId,
          dosageInstructions: newPrescription.dosage,
          frequency: newPrescription.frequency,
          durationDays: parseInt(newPrescription.duration) || 0,
          notes: newPrescription.instructions,
          quantityPrescribed: newPrescription.quantity
        }]
      };

      await prescriptionApi.create(prescriptionData);
      
      // Reset form
      setNewPrescription({
        medicationId: 0,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      });
      setShowPrescriptionModal(false);
      
      // Refetch prescriptions
      refetchPrescriptions();
      
      Swal.fire('Success', 'Prescription created successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PARTIALLY_DISPENSED': return 'info';
      case 'FULLY_DISPENSED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'REPLACED': return 'dark';
      default: return 'secondary';
    }
  };

  const getCategoryStats = () => {
    const stats = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-semibold">Pharmacy Actions</div>
        {Object.keys(stats).length > 0 && (
          <div className="d-flex gap-2">
            {Object.entries(stats).map(([category, count]) => (
              <Badge key={category} bg={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>
                {category}: {count}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions Section */}
      {queueItemId && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Prescriptions</h6>
            <div className="d-flex gap-2">
              <Button 
                size="sm" 
                variant="success"
                onClick={() => setShowPrescriptionModal(true)}
                disabled={isReadonly || !queueItemId || !patientId}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Create Prescription
              </Button>
              {prescriptions.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={() => setShowDispenseModal(true)}
                  disabled={isReadonly || selectedPrescriptions.length === 0}
                >
                  <i className="bi bi-check-square me-1"></i>
                  Dispense Selected ({selectedPrescriptions.length})
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {prescriptionsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2 text-muted small">Loading prescriptions...</div>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-muted text-center py-3">
                <i className="bi bi-clipboard-x fs-4"></i>
                <div className="mt-2">No prescriptions found for this patient</div>
                <small>Prescriptions are created in the consultation section</small>
              </div>
            ) : (
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedPrescriptions.length === prescriptions.length && prescriptions.length > 0}
                        onChange={(e) => handleSelectAllPrescriptions(e.target.checked)}
                      />
                    </th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Prescribed</th>
                    <th>Dispensed</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Instructions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(prescription => {
                    const remaining = (prescription.prescribedQuantity || prescription.quantity) - (prescription.dispensedQuantity || 0);
                    return (
                      <tr key={prescription.id} className={prescription.status === 'REPLACED' ? 'table-secondary' : ''}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedPrescriptions.includes(prescription.id)}
                            onChange={(e) => handleSelectPrescription(prescription.id, e.target.checked)}
                            disabled={prescription.status === 'REPLACED'}
                          />
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{prescription.medicationName}</div>
                            <small className="text-muted">ID: {prescription.medicationId}</small>
                          </div>
                        </td>
                        <td>{prescription.dosage}</td>
                        <td>{prescription.frequency}</td>
                        <td>{prescription.duration}</td>
                        <td>{prescription.prescribedQuantity || prescription.quantity}</td>
                        <td>{prescription.dispensedQuantity || 0}</td>
                        <td>
                          <span className={remaining > 0 ? 'text-warning' : 'text-success'}>
                            {remaining}
                          </span>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(prescription.status)}>
                            {prescription.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <div className="small text-muted" style={{ maxWidth: '150px' }}>
                            {prescription.instructions}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {remaining > 0 && prescription.status !== 'REPLACED' && (
                              <Button 
                                size="sm" 
                                variant="outline-success"
                                onClick={() => handleDispenseRemaining(prescription.id, remaining)}
                                title="Dispense remaining"
                                disabled={submitting}
                              >
                                <i className="bi bi-check-square"></i>
                              </Button>
                            )}
                            {prescription.status === 'REPLACED' && (
                              <span className="text-muted small">
                                <i className="bi bi-info-circle me-1"></i>
                                Replaced
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Pharmacy Actions */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {PHARMACY_TITLES.map((title) => (
          <Button
            key={title.title}
            variant="outline-primary"
            size="sm"
            onClick={() => handleAddItem(title.title, title.category as PharmacyItem['category'])}
            disabled={submitting || loading}
          >
            <i className={`bi bi-${title.category === 'medication' ? 'capsule' : 
                          title.category === 'prescription' ? 'file-medical' : 
                          title.category === 'inventory' ? 'box' : 'clipboard'}`}></i>
            {title.title}
          </Button>
        ))}
      </div>

      {/* Custom Action */}
      <div className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Add custom action..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddItem(customTitle, selectedCategory, true);
              }
            }}
            disabled={submitting || loading}
          />
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PharmacyItem['category'])}
            disabled={submitting || loading}
            style={{ maxWidth: '150px' }}
          >
            <option value="medication">Medication</option>
            <option value="prescription">Prescription</option>
            <option value="inventory">Inventory</option>
            <option value="other">Other</option>
          </Form.Select>
          <Button 
            variant="outline-secondary" 
            onClick={() => handleAddItem(customTitle, selectedCategory, true)}
            disabled={isReadonly || !customTitle.trim() || submitting || loading}
          >
            Add
          </Button>
        </InputGroup>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mb-3">
          {items.map((item) => (
            <Card key={item.id} className="mb-2">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={CATEGORY_COLORS[item.category]}>
                      {item.category}
                    </Badge>
                    <span className="fw-semibold">{item.title}</span>
                    {item.isCustom && (
                      <Badge bg="secondary" className="small">Custom</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isReadonly || submitting || loading}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
                <RichTextEditor
                  value={item.details}
                  onChange={(value) => handleDetailsChange(item.id, value)}
                  placeholder="Add details..."
                  theme="snow"
                  style={{ background: 'white' }}
                  readOnly={isReadonly}
                />
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-end">
        <Button
          variant="success"
          onClick={async () => {
            if (!queueItemId) {
              Swal.fire('Error', 'Queue item ID is required to save pharmacy actions', 'error');
              return;
            }

            setSubmitting(true);
            try {
              if (items.length > 0) {
                // Save all pharmacy actions to backend
                const actionsToSave = items.map((item, index) => ({
                  id: item.id, // Include ID for existing items
                  title: item.title,
                  details: item.details,
                  category: item.category,
                  isCustom: item.isCustom,
                  sortOrder: index
                }));

                await bulkUpsertMutation.mutateAsync(actionsToSave);
                
                Swal.fire({
                  title: 'Pharmacy Actions Saved',
                  text: `${items.length} pharmacy action(s) have been saved successfully.`,
                  icon: 'success',
                  confirmButtonText: 'OK'
                });
                
                // Clear the action items after successful submission
                setItems([]);
                onChange?.([]);
              } else {
                Swal.fire({
                  title: 'No Actions to Submit',
                  text: 'Please add some pharmacy actions before submitting.',
                  icon: 'info',
                  confirmButtonText: 'OK'
                });
              }
              
              // Call the parent onSubmit if provided
              await onSubmit?.(items);
            } catch (error) {
              console.error('Failed to save pharmacy actions:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save pharmacy actions. Please try again.'
              });
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={isReadonly || submitting || loading}
        >
          {submitting || loading ? 'Submitting...' : 'Submit Pharmacy Actions'}
        </Button>
      </div>

      {/* Create Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Medication *</Form.Label>
                <Form.Select
                  value={newPrescription.medicationId}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, medicationId: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select medication...</option>
                  {medications.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.name} - {med.dosageForm || 'N/A'}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={newPrescription.quantity}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Dosage *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 500mg, 2 tablets"
                  value={newPrescription.dosage}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Frequency *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Twice daily, Every 8 hours"
                  value={newPrescription.frequency}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                  required
                />
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Duration (days) *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  placeholder="e.g., 7"
                  value={newPrescription.duration}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Additional instructions for the patient..."
                value={newPrescription.instructions}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleCreatePrescription}
            disabled={submitting || !newPrescription.medicationId || !newPrescription.dosage || !newPrescription.frequency || !newPrescription.duration}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Create Prescription
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Dispense Modal */}
      <Modal show={showDispenseModal} onHide={() => setShowDispenseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Dispense Medications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6>Selected Prescriptions ({selectedPrescriptions.length})</h6>
            <p className="text-muted small">Specify quantities to dispense for each selected prescription.</p>
          </div>
          
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Prescribed</th>
                <th>Dispensed</th>
                <th>Remaining</th>
                <th>Dispense Qty</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.filter(p => selectedPrescriptions.includes(p.id)).map(prescription => {
                const remaining = (prescription.prescribedQuantity || prescription.quantity) - (prescription.dispensedQuantity || 0);
                return (
                  <tr key={prescription.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{prescription.medicationName}</div>
                        <small className="text-muted">{prescription.dosage} - {prescription.frequency}</small>
                      </div>
                    </td>
                    <td>{prescription.prescribedQuantity || prescription.quantity}</td>
                    <td>{prescription.dispensedQuantity || 0}</td>
                    <td>
                      <span className={remaining > 0 ? 'text-warning' : 'text-success'}>
                        {remaining}
                      </span>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        max={remaining}
                        value={dispenseQuantities[prescription.id] || 0}
                        onChange={(e) => setDispenseQuantities(prev => ({
                          ...prev,
                          [prescription.id]: parseInt(e.target.value) || 0
                        }))}
                        style={{ width: '80px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDispenseModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleDispense}>
            <i className="bi bi-check-square me-1"></i>
            Dispense Medications
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};