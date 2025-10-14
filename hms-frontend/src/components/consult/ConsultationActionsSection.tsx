import React, { useState, useEffect } from 'react';
import { fetchConsultationTitles, ConsultationTitleDto } from '../../services/consultationTitlesApi';
import { testCatalogApi, diagnosticOrderApi } from '../../services/diagnosticsApi';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup, Modal, Card, Badge, Table, Alert } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
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

  const handleAddItem = (title: string, isCustom = false) => {
    if (!title.trim()) return;
    const newItem: ConsultationItem = {
      id: Date.now() + Math.random(),
      title,
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

  return (
    <div className="mb-2">
      <div className="fw-semibold mb-2">Consultation Actions</div>
      <Form.Group as={Row} className="mb-2 align-items-center">
        <Col sm={6}>
          <Form.Select onChange={e => handleAddItem(e.target.value)} defaultValue="" disabled={loadingTitles}>
            <option value="">Add from configured titles...</option>
            {consultationTitles.map(t => (
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
            <Button variant="outline-primary" onClick={() => handleAddItem(customTitle, true)} disabled={!customTitle.trim()}>
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
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit order:', order.id);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                      )}
                      {order.status === 'ORDERED' && (
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => {
                            // TODO: Implement cancel functionality
                            console.log('Cancel order:', order.id);
                          }}
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
    </div>
  );
};
