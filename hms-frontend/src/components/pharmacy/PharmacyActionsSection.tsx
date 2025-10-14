import React, { useState } from 'react';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup, Card, Badge, Modal, Table } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { medicationApi, type Medication } from '../../services/pharmacyApi';
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
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED' | 'CANCELLED';
  prescribedAt: string;
  dispensedAt?: string;
}


interface PharmacyActionsSectionProps {
  initialItems?: PharmacyItem[];
  onChange?: (items: PharmacyItem[]) => void;
  onSubmit?: (items: PharmacyItem[]) => void | Promise<void>;
  loading?: boolean;
  queueItemId?: number; // Add queue item ID for prescription association
}

const PHARMACY_TITLES = [
  { title: 'Prescribe Medication', category: 'prescription' },
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
  queueItemId
}) => {
  const [items, setItems] = useState<PharmacyItem[]>(initialItems);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PharmacyItem['category']>('medication');
  const [submitting, setSubmitting] = useState(false);
  
  // Prescription state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Partial<PrescriptionItem>>({});
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<number[]>([]);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseQuantities, setDispenseQuantities] = useState<Record<number, number>>({});
  
  // Fetch medications for prescription
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => medicationApi.getAll(),
  });

  // Sync items state with initialItems prop
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleAddItem = (title: string, category: PharmacyItem['category'] = 'medication', isCustom = false) => {
    if (!title.trim()) return;
    
    // Special handling for prescription
    if (title === 'Prescribe Medication') {
      setShowPrescriptionModal(true);
      return;
    }
    
    const newItem: PharmacyItem = {
      id: Date.now() + Math.random(),
      title,
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

  // Prescription handlers
  const handleAddPrescription = () => {
    if (!currentPrescription.medicationId || !currentPrescription.dosage || !currentPrescription.frequency) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }
    
    const selectedMedication = medications.find((m: Medication) => m.id === currentPrescription.medicationId);
    const quantity = currentPrescription.quantity || 1;
    const newPrescription: PrescriptionItem = {
      id: Date.now() + Math.random(),
      medicationId: currentPrescription.medicationId!,
      medicationName: selectedMedication?.name || '',
      dosage: currentPrescription.dosage!,
      frequency: currentPrescription.frequency!,
      duration: currentPrescription.duration || '',
      instructions: currentPrescription.instructions || '',
      quantity,
      prescribedQuantity: quantity,
      dispensedQuantity: 0,
      status: 'PENDING',
      prescribedAt: new Date().toISOString()
    };
    
    setPrescriptions(prev => [...prev, newPrescription]);
    setCurrentPrescription({});
    setShowPrescriptionModal(false);
  };

  const handleRemovePrescription = (id: number) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePrescription = (id: number, updates: Partial<PrescriptionItem>) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
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

  const handleBulkDispense = () => {
    if (selectedPrescriptions.length === 0) {
      Swal.fire('Error', 'Please select prescriptions to dispense', 'error');
      return;
    }
    setShowDispenseModal(true);
  };

  const handleDispense = () => {
    const dispenseData = selectedPrescriptions.map(id => {
      const prescription = prescriptions.find(p => p.id === id);
      const dispenseQty = dispenseQuantities[id] || 0;
      return {
        prescriptionId: id,
        quantity: dispenseQty,
        remainingQuantity: (prescription?.prescribedQuantity || 0) - (prescription?.dispensedQuantity || 0) - dispenseQty
      };
    });

    // Update prescriptions with dispensed quantities
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
    Swal.fire('Success', 'Medications dispensed successfully', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PARTIALLY_DISPENSED': return 'info';
      case 'FULLY_DISPENSED': return 'success';
      case 'CANCELLED': return 'danger';
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

      <Card className="mb-3">
        <Card.Header className="py-2">
          <small className="text-muted">Add Pharmacy Action</small>
        </Card.Header>
        <Card.Body className="py-3">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label className="small">Select from common actions:</Form.Label>
              <Form.Select onChange={e => {
                const selected = PHARMACY_TITLES.find(t => t.title === e.target.value);
                if (selected) {
                  handleAddItem(selected.title, selected.category as PharmacyItem['category']);
                }
              }} defaultValue="">
                <option value="">Choose a pharmacy action...</option>
                {PHARMACY_TITLES.map(t => (
                  <option key={t.title} value={t.title}>{t.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label className="small">Or create custom action:</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Custom action title..."
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                />
                <Form.Select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value as PharmacyItem['category'])}
                  style={{ maxWidth: '120px' }}
                >
                  <option value="medication">Medication</option>
                  <option value="prescription">Prescription</option>
                  <option value="inventory">Inventory</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleAddItem(customTitle, selectedCategory, true)} 
                  disabled={!customTitle.trim()}
                >
                  Add
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {items.length === 0 && (
        <div className="text-muted small mb-2 text-center py-3">
          <i className="bi bi-capsule-pill me-2"></i>
          No pharmacy actions added yet. Add actions to track pharmacy-related activities.
        </div>
      )}

      {items.map((item, idx) => (
        <Card key={item.id} className="mb-3">
          <Card.Header className="py-2 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Badge bg={CATEGORY_COLORS[item.category]} className="small">
                {item.category}
              </Badge>
              <span className="fw-semibold">{item.title}</span>
              {item.isCustom && <Badge bg="outline-secondary" className="small">Custom</Badge>}
            </div>
            <Button 
              size="sm" 
              variant="outline-danger" 
              onClick={() => handleRemoveItem(item.id)}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </Card.Header>
          <Card.Body className="py-3">
            <RichTextEditor
              theme="snow"
              value={item.details}
              onChange={val => handleDetailsChange(item.id, val)}
              placeholder="Enter details for this pharmacy action..."
              style={{ background: 'white' }}
            />
          </Card.Body>
        </Card>
      ))}

      {/* Prescriptions Section */}
      <Card className="mb-3">
        <Card.Header className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Medicine Prescriptions</span>
            <div className="d-flex gap-2">
              <Button 
                size="sm" 
                variant="outline-primary"
                onClick={() => setShowPrescriptionModal(true)}
              >
                <i className="bi bi-plus me-1"></i>
                Add Prescription
              </Button>
              {selectedPrescriptions.length > 0 && (
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={handleBulkDispense}
                >
                  <i className="bi bi-check-square me-1"></i>
                  Dispense Selected ({selectedPrescriptions.length})
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="py-3">
          {prescriptions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-capsule-pill display-6 d-block mb-2"></i>
              No prescriptions yet. Add a prescription to get started.
            </div>
          ) : (
            <Table responsive size="sm" hover>
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
                    <tr key={prescription.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedPrescriptions.includes(prescription.id)}
                          onChange={(e) => handleSelectPrescription(prescription.id, e.target.checked)}
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
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => {
                              setCurrentPrescription(prescription);
                              setShowPrescriptionModal(true);
                            }}
                            title="Edit prescription"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          {remaining > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline-success"
                              onClick={() => {
                                setSelectedPrescriptions([prescription.id]);
                                setDispenseQuantities({ [prescription.id]: remaining });
                                handleBulkDispense();
                              }}
                              title="Dispense remaining"
                            >
                              <i className="bi bi-check-square"></i>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleRemovePrescription(prescription.id)}
                            title="Remove prescription"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
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
          {submitting || loading ? 'Submitting...' : 'Submit Pharmacy Actions'}
        </Button>
      </div>

      {/* Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Prescribe Medication</Modal.Title>
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
                      medicationId: parseInt(e.target.value) 
                    }))}
                    disabled={medicationsLoading}
                  >
                    <option value="">Select medication...</option>
                    {medications.map((med: Medication) => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.strength}) - {med.dosageForm}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Dosage *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 500mg"
                    value={currentPrescription.dosage || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      dosage: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Frequency *</Form.Label>
                  <Form.Select
                    value={currentPrescription.frequency || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      frequency: e.target.value 
                    }))}
                  >
                    <option value="">Select frequency...</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="Every 12 hours">Every 12 hours</option>
                    <option value="As needed">As needed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 7 days"
                    value={currentPrescription.duration || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      duration: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPrescription.quantity || 1}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) 
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Take with food"
                    value={currentPrescription.instructions || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      instructions: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPrescription}>
            Add Prescription
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
              {selectedPrescriptions.map(prescriptionId => {
                const prescription = prescriptions.find(p => p.id === prescriptionId);
                if (!prescription) return null;
                
                const remaining = (prescription.prescribedQuantity || prescription.quantity) - (prescription.dispensedQuantity || 0);
                return (
                  <tr key={prescriptionId}>
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
                        value={dispenseQuantities[prescriptionId] || 0}
                        onChange={(e) => setDispenseQuantities(prev => ({
                          ...prev,
                          [prescriptionId]: parseInt(e.target.value) || 0
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
