import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { diagnosticOrderApi } from '../../../services/diagnosticsApi';

interface DiagnosticOrder { 
  id: number;
  orderNumber: string;
  patientId: number;
  patientName: string;
  queueItemId: number;
  ticketNumber: string;
  orderedBy: string;
  orderedByName: string;
  status: string;
  urgency: string;
  clinicalNotes?: string;
  orderedAt: string;
  completedAt?: string;
  diagnosticItems: DiagnosticItem[];
}

interface DiagnosticItem {
  id: number;
  testCode: string;
  testName: string;
  testType: string;
  department: string;
  status: string;
  cost: number;
}

export function DiagnosticOrderAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DiagnosticOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  
  const queryClient = useQueryClient();

  const { data: diagnosticOrders = [], isLoading } = useQuery({
    queryKey: ['diagnostic-orders', searchTerm, filterStatus, filterUrgency, filterPatient],
    queryFn: () => diagnosticOrderApi.getAll()
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log('Updating order status:', { id, status });
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-orders'] });
      Swal.fire('Success', 'Order status updated successfully', 'success');
    }
  });

  const handleViewDetails = (order: DiagnosticOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    Swal.fire({
      title: 'Update Order Status?',
      text: `Are you sure you want to change the status to ${status}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatusMutation.mutate({ id, status });
      }
    });
  };

  const filteredOrders = diagnosticOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesUrgency = !filterUrgency || order.urgency === filterUrgency;
    const matchesPatient = !filterPatient || order.patientName.toLowerCase().includes(filterPatient.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesPatient;
  });

  const statusOptions = ['ORDERED', 'IN_PROGRESS', 'SAMPLE_COLLECTED', 'SAMPLE_RECEIVED', 'IN_PROCESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];
  const urgencyOptions = ['ROUTINE', 'STAT', 'EMERGENCY'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Diagnostic Orders Management</h5>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
              >
                <option value="">All Urgency</option>
                {urgencyOptions.map(urgency => (
                  <option key={urgency} value={urgency}>{urgency}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Filter by patient..."
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterUrgency('');
                  setFilterPatient('');
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Diagnostic Orders Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading diagnostic orders...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Ticket #</th>
                  <th>Ordered By</th>
                  <th>Status</th>
                  <th>Urgency</th>
                  <th>Tests</th>
                  <th>Ordered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <code>{order.orderNumber}</code>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{order.patientName}</div>
                        <small className="text-muted">ID: {order.patientId}</small>
                      </div>
                    </td>
                    <td>
                      <code>{order.ticketNumber}</code>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{order.orderedByName}</div>
                        <small className="text-muted">{order.orderedBy}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'danger' :
                        order.status === 'IN_PROGRESS' ? 'warning' : 'primary'
                      }>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={
                        order.urgency === 'EMERGENCY' ? 'danger' :
                        order.urgency === 'STAT' ? 'warning' : 'info'
                      }>
                        {order.urgency}
                      </Badge>
                    </td>
                    <td>
                      <div className="small">
                        {order.diagnosticItems.map(item => (
                          <div key={item.id} className="mb-1">
                            <span className="fw-semibold">{item.testName}</span>
                            <br />
                            <small className="text-muted">{item.testCode} - {item.department}</small>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {new Date(order.orderedAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewDetails(order)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          disabled={order.status === 'COMPLETED'}
                        >
                          <i className="bi bi-check"></i>
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
}

interface OrderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  order: DiagnosticOrder | null;
}

function OrderDetailsModal({ show, onHide, order }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Order Details - {order.orderNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Patient Information</div>
            <div>Name: {order.patientName}</div>
            <div>Patient ID: {order.patientId}</div>
            <div>Ticket: {order.ticketNumber}</div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Order Information</div>
            <div>Ordered By: {order.orderedByName}</div>
            <div>Status: <Badge bg="primary">{order.status}</Badge></div>
            <div>Urgency: <Badge bg="warning">{order.urgency}</Badge></div>
          </Col>
        </Row>

        <div className="mb-3">
          <div className="fw-semibold">Clinical Notes</div>
          <div className="text-muted">{order.clinicalNotes || 'No notes provided'}</div>
        </div>

        <div className="mb-3">
          <div className="fw-semibold">Diagnostic Tests</div>
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>Test Code</th>
                <th>Test Name</th>
                <th>Type</th>
                <th>Department</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {order.diagnosticItems.map(item => (
                <tr key={item.id}>
                  <td><code>{item.testCode}</code></td>
                  <td>{item.testName}</td>
                  <td><Badge bg="info">{item.testType}</Badge></td>
                  <td><Badge bg="secondary">{item.department}</Badge></td>
                  <td><Badge bg="primary">{item.status}</Badge></td>
                  <td>${item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="text-muted small">
          Ordered: {new Date(order.orderedAt).toLocaleString()}
          {order.completedAt && (
            <span> | Completed: {new Date(order.completedAt).toLocaleString()}</span>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
