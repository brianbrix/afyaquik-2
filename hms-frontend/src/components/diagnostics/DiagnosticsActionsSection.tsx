import React, { useState } from 'react';
import { testCatalogApi, diagnosticOrderApi, resultTemplateApi, diagnosticResultApi, diagnosticItemApi } from '../../services/diagnosticsApi';
import { Button, Form, Row, Col, Card, Badge, Table, Alert, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';

interface DiagnosticsActionsSectionProps {
  queueItemId?: number;
  patientId?: number;
}

export const DiagnosticsActionsSection: React.FC<DiagnosticsActionsSectionProps> = ({ 
  queueItemId,
  patientId
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedOrderForResults, setSelectedOrderForResults] = useState<any>(null);
  
  // Diagnostic order creation state
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [urgency, setUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Edit order state
  const [editClinicalNotes, setEditClinicalNotes] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editUrgency, setEditUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Results state
  const [resultTemplates, setResultTemplates] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<number, any>>({});
  const [savingResults, setSavingResults] = useState(false);
  const [existingResults, setExistingResults] = useState<any[]>([]);

  // Fetch existing diagnostic orders for this queue item
  const { data: existingOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['diagnostic-orders', queueItemId],
    queryFn: () => diagnosticOrderApi.getByQueueItem(queueItemId!),
    enabled: !!queueItemId,
  });

  // Fetch available diagnostic tests
  const { data: availableTests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['diagnostic-tests'],
    queryFn: () => testCatalogApi.getAll({ active: true }),
  });

  // Fetch result templates for the selected order
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['result-templates', selectedOrderForResults?.id],
    queryFn: () => {
      if (!selectedOrderForResults?.diagnosticItems) return Promise.resolve([]);
      const testCatalogIds = selectedOrderForResults.diagnosticItems.map((item: any) => item.testCatalogId);
      return Promise.all(testCatalogIds.map((id: number) => resultTemplateApi.getAll({ testCatalogId: id }))).then(results => results.flat());
    },
    enabled: !!selectedOrderForResults,
  });

  // Fetch existing results for the selected order
  const { data: results = [], isLoading: resultsLoading, refetch: refetchResults } = useQuery({
    queryKey: ['diagnostic-results', selectedOrderForResults?.id],
    queryFn: () => diagnosticResultApi.getAll({ diagnosticOrderId: selectedOrderForResults.id }),
    enabled: !!selectedOrderForResults,
  });

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await diagnosticOrderApi.updateStatus(orderId, newStatus);
      refetchOrders();
      Swal.fire('Success', `Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
      Swal.fire('Error', 'Failed to update order status', 'error');
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

  const handleAddResults = (order: any) => {
    setSelectedOrderForResults(order);
    setTestResults({});
    setShowResultsModal(true);
  };

  // Load existing results when results are fetched
  React.useEffect(() => {
    if (results && results.length > 0) {
      const resultsMap: Record<number, any> = {};
      
      // Group results by testCatalogId
      results.forEach((result: any) => {
        if (!resultsMap[result.testCatalogId]) {
          resultsMap[result.testCatalogId] = {};
        }
        resultsMap[result.testCatalogId][result.fieldName] = result.resultValue;
      });
      
      setTestResults(resultsMap);
    }
  }, [results]);

  const handleResultChange = (testCatalogId: number, fieldName: string, value: any) => {
    setTestResults(prev => ({
      ...prev,
      [testCatalogId]: {
        ...prev[testCatalogId],
        [fieldName]: value
      }
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedOrderForResults) return;

    setSavingResults(true);
    try {
      // Process each test result
      for (const [testCatalogId, resultData] of Object.entries(testResults)) {
        const testCatalogIdNum = parseInt(testCatalogId);
        const diagnosticItem = selectedOrderForResults.diagnosticItems.find((item: any) => item.testCatalogId === testCatalogIdNum);
        
        if (!diagnosticItem) continue;

        // Get templates for this test to create individual results for each field
        const itemTemplates = templates.filter((template: any) => template.testCatalogId === testCatalogIdNum);
        
        // Create a result for each template field
        for (const template of itemTemplates) {
          const fieldValue = resultData[template.fieldName];
          if (!fieldValue) continue; // Skip empty fields

          // Check if result already exists for this field
          const existingResult = results.find((r: any) => 
            r.testCatalogId === testCatalogIdNum && r.fieldName === template.fieldName
          );
          
          const resultPayload = {
            diagnosticOrderId: selectedOrderForResults.id,
            diagnosticItemId: diagnosticItem.id,
            resultTemplateId: template.id,
            fieldName: template.fieldName,
            fieldLabel: template.fieldLabel,
            resultValue: fieldValue,
            resultText: template.fieldType === 'TEXT' ? fieldValue : null,
            status: 'COMPLETED',
            performedBy: 'current-user', // TODO: Get from auth context
            performedByName: 'Current User' // TODO: Get from auth context
          };

          if (existingResult) {
            // Update existing result
            await diagnosticResultApi.update(existingResult.id, resultPayload);
          } else {
            // Create new result
            await diagnosticResultApi.create(resultPayload);
          }
        }

        // Update diagnostic item status to COMPLETED
        try {
          await diagnosticItemApi.updateStatus(diagnosticItem.id, 'COMPLETED');
        } catch (error) {
          console.error(`Failed to update status for diagnostic item ${diagnosticItem.id}:`, error);
        }
      }

      // Refetch results and orders
      refetchResults();
      refetchOrders();

      Swal.fire('Success', 'Results saved successfully', 'success');
      setShowResultsModal(false);
    } catch (error) {
      console.error('Failed to save results:', error);
      Swal.fire('Error', 'Failed to save results', 'error');
    } finally {
      setSavingResults(false);
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

  const handleValidateResult = async (resultId: number) => {
    const { value: validationNotes } = await Swal.fire({
      title: 'Validate Result',
      input: 'textarea',
      inputLabel: 'Validation Notes (Optional)',
      inputPlaceholder: 'Enter any validation notes...',
      showCancelButton: true,
      confirmButtonText: 'Validate',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        // Optional validation notes
        return null;
      }
    });

    if (validationNotes !== undefined) {
      try {
        await diagnosticResultApi.validate(resultId, validationNotes || '');
        refetchResults();
        refetchOrders();
        Swal.fire('Success', 'Result validated successfully', 'success');
      } catch (error) {
        console.error('Failed to validate result:', error);
        Swal.fire('Error', 'Failed to validate result', 'error');
      }
    }
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
      setShowCreateModal(false);
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

  const getStatusActions = (order: any) => {
    switch (order.status) {
      case 'ORDERED':
        return (
          <div className="d-flex gap-1">
            <Button 
              size="sm" 
              variant="outline-success"
              onClick={() => handleUpdateOrderStatus(order.id, 'IN_PROGRESS')}
            >
              <i className="bi bi-play-circle me-1"></i>
              Start Work
            </Button>
            <Button 
              size="sm" 
              variant="outline-primary"
              onClick={() => handleEditOrder(order)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
            <Button 
              size="sm" 
              variant="outline-danger"
              onClick={() => handleCancelOrder(order.id)}
            >
              <i className="bi bi-x-circle"></i>
            </Button>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="d-flex gap-1">
            <Button 
              size="sm" 
              variant="outline-info"
              onClick={() => handleAddResults(order)}
            >
              <i className="bi bi-clipboard-data me-1"></i>
              Add Results
            </Button>
            <Button 
              size="sm" 
              variant="outline-success"
              onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
            >
              <i className="bi bi-check-circle me-1"></i>
              Complete
            </Button>
            <Button 
              size="sm" 
              variant="outline-warning"
              onClick={() => handleUpdateOrderStatus(order.id, 'ORDERED')}
            >
              <i className="bi bi-arrow-left-circle me-1"></i>
              Back to Ordered
            </Button>
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="d-flex gap-1">
            <Button 
              size="sm" 
              variant="outline-info"
              onClick={() => handleUpdateOrderStatus(order.id, 'IN_PROGRESS')}
            >
              <i className="bi bi-arrow-left-circle me-1"></i>
              Reopen
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-semibold">Diagnostic Orders Management</div>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => setShowCreateModal(true)}
          disabled={!queueItemId || !patientId}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Create New Order
        </Button>
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
            <Card key={order.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
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
                      <div className="text-muted small mb-2">
                        <strong>Clinical Notes:</strong> {order.clinicalNotes}
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-1">
                    {getStatusActions(order)}
                  </div>
                </div>
                
                {/* Diagnostic Items Table */}
                {order.diagnosticItems && order.diagnosticItems.length > 0 && (
                  <div className="mt-3">
                    <div className="fw-semibold mb-2">Tests Ordered:</div>
                    <Table size="sm" striped>
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Type</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.diagnosticItems.map((item: any, index: number) => (
                          <tr key={index}>
                            <td>{item.testName}</td>
                            <td>{item.testType}</td>
                            <td>{item.department}</td>
                            <td>
                              <Badge bg={item.status === 'PENDING' ? 'secondary' : item.status === 'IN_PROGRESS' ? 'warning' : item.status === 'COMPLETED' ? 'primary' : item.status === 'VALIDATED' ? 'success' : item.status === 'REJECTED' ? 'danger' : item.status === 'CANCELLED' ? 'dark' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </td>
                            <td>
                              {item.status === 'PENDING' && (
                                <Button size="sm" variant="outline-primary">
                                  <i className="bi bi-play-circle me-1"></i>
                                  Start
                                </Button>
                              )}
                              {item.status === 'IN_PROGRESS' && (
                                <Button size="sm" variant="outline-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Complete
                                </Button>
                              )}
                              {item.status === 'COMPLETED' && (
                                <Button 
                                  size="sm" 
                                  variant="outline-info"
                                  onClick={() => handleValidateResult(item.id)}
                                >
                                  <i className="bi bi-check-circle-check me-1"></i>
                                  Validate
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-muted small mb-3">
          No diagnostic orders found for this patient
        </div>
      )}

      {/* Create Order Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Diagnostic Order</Modal.Title>
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
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
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

      {/* Add Results Modal */}
      <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Add Diagnostic Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderForResults && (
            <div>
              <div className="mb-3">
                <h6>Order: {selectedOrderForResults.orderNumber}</h6>
                <p className="text-muted small">
                  {selectedOrderForResults.diagnosticItems?.length || 0} test(s) • {selectedOrderForResults.urgency} priority
                </p>
              </div>
              
              {templatesLoading || resultsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading result templates and existing results...
                </div>
              ) : selectedOrderForResults.diagnosticItems && selectedOrderForResults.diagnosticItems.length > 0 ? (
                <div>
                  <h6 className="mb-3">Test Results</h6>
                  {selectedOrderForResults.diagnosticItems.map((item: any, index: number) => {
                    const itemTemplates = templates.filter((template: any) => template.testCatalogId === item.testCatalogId);
                    return (
                      <Card key={index} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <h6 className="mb-1">{item.testName}</h6>
                              <small className="text-muted">{item.testType} • {item.department}</small>
                            </div>
                            <Badge bg={item.status === 'PENDING' ? 'secondary' : item.status === 'IN_PROGRESS' ? 'warning' : item.status === 'COMPLETED' ? 'primary' : item.status === 'VALIDATED' ? 'success' : item.status === 'REJECTED' ? 'danger' : item.status === 'CANCELLED' ? 'dark' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </div>
                          
                          {itemTemplates.length > 0 ? (
                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Result Fields</h6>
                                {testResults[item.testCatalogId] && Object.keys(testResults[item.testCatalogId]).length > 0 && (
                                  <Badge bg="info">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Results Loaded
                                  </Badge>
                                )}
                              </div>
                              {itemTemplates.map((template: any, templateIndex: number) => (
                                <Form.Group key={templateIndex} className="mb-3">
                                  <Form.Label>
                                    {template.fieldName}
                                    {template.required && <span className="text-danger ms-1">*</span>}
                                    {template.unit && <span className="text-muted ms-1">({template.unit})</span>}
                                  </Form.Label>
                                  
                                  {template.fieldType === 'TEXT' && (
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      placeholder={`Enter ${template.fieldName.toLowerCase()}...`}
                                      value={testResults[item.testCatalogId]?.[template.fieldName] || ''}
                                      onChange={(e) => handleResultChange(item.testCatalogId, template.fieldName, e.target.value)}
                                    />
                                  )}
                                  
                                  {template.fieldType === 'NUMBER' && (
                                    <Form.Control
                                      type="number"
                                      step="any"
                                      placeholder={`Enter ${template.fieldName.toLowerCase()}...`}
                                      value={testResults[item.testCatalogId]?.[template.fieldName] || ''}
                                      onChange={(e) => handleResultChange(item.testCatalogId, template.fieldName, e.target.value)}
                                    />
                                  )}
                                  
                                  {template.fieldType === 'DROPDOWN' && (
                                    <Form.Select
                                      value={testResults[item.testCatalogId]?.[template.fieldName] || ''}
                                      onChange={(e) => handleResultChange(item.testCatalogId, template.fieldName, e.target.value)}
                                    >
                                      <option value="">Select {template.fieldName.toLowerCase()}...</option>
                                      {template.options?.split(',').map((option: string, optionIndex: number) => (
                                        <option key={optionIndex} value={option.trim()}>{option.trim()}</option>
                                      ))}
                                    </Form.Select>
                                  )}
                                  
                                  {template.referenceRange && (
                                    <Form.Text className="text-muted">
                                      Reference Range: {template.referenceRange}
                                    </Form.Text>
                                  )}
                                </Form.Group>
                              ))}
                              
                              <div className="d-flex gap-2 mt-3">
                                <Button size="sm" variant="outline-primary">
                                  <i className="bi bi-upload me-1"></i>
                                  Upload File
                                </Button>
                                <Button size="sm" variant="outline-secondary">
                                  <i className="bi bi-plus-circle me-1"></i>
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <Alert variant="warning">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                No result template configured for this test. Please contact the administrator.
                              </Alert>
                            </div>
                          )}
                          
                          {item.status === 'COMPLETED' && (
                            <div className="mt-2">
                              <div className="bg-light p-2 rounded">
                                <small className="text-muted">Results completed - awaiting validation</small>
                              </div>
                            </div>
                          )}
                          
                          {item.status === 'VALIDATED' && (
                            <div className="mt-2">
                              <div className="bg-success bg-opacity-10 p-2 rounded">
                                <small className="text-success">Results validated and finalized</small>
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No diagnostic items found for this order.
                </Alert>
              )}
              
              <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Instructions:</strong> Enter results for each test using the configured templates. All required fields must be completed before saving.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultsModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleSaveResults}
            disabled={savingResults}
          >
            {savingResults ? (
              <>
                <div className="spinner-border spinner-border-sm me-2"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Save All Results
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};