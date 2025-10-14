import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { diagnosticResultApi } from '../../../services/diagnosticsApi';

interface DiagnosticResult {
  id: number;
  orderNumber: string;
  patientName: string;
  testName: string;
  fieldName: string;
  fieldLabel: string;
  status: string;
  resultValue: string;
  resultText: string;
  interpretation: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  validatedBy: string;
  validatedByName: string;
  validatedAt?: string;
  validationNotes: string;
  normalRange: string;
  units: string;
}

export function DiagnosticResultAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DiagnosticResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [filterTest, setFilterTest] = useState('');
  
  const queryClient = useQueryClient();

  const { data: diagnosticResults = [], isLoading } = useQuery({
    queryKey: ['diagnostic-results', searchTerm, filterStatus, filterPatient, filterTest],
    queryFn: () => diagnosticResultApi.getAll()
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log('Updating result status:', { id, status });
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-results'] });
      Swal.fire('Success', 'Result status updated successfully', 'success');
    }
  });

  const handleViewDetails = (result: DiagnosticResult) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    Swal.fire({
      title: 'Update Result Status?',
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

  const filteredResults = diagnosticResults.filter(result => {
    const matchesSearch = !searchTerm || 
      result.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || result.status === filterStatus;
    const matchesPatient = !filterPatient || result.patientName.toLowerCase().includes(filterPatient.toLowerCase());
    const matchesTest = !filterTest || result.testName.toLowerCase().includes(filterTest.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesPatient && matchesTest;
  });

  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'REJECTED', 'CANCELLED'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Diagnostic Results Management</h5>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search results..."
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
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Filter by patient..."
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Filter by test..."
                value={filterTest}
                onChange={(e) => setFilterTest(e.target.value)}
              />
            </Col>
            <Col md={1}>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterPatient('');
                  setFilterTest('');
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Diagnostic Results Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading diagnostic results...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Field</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Performed By</th>
                  <th>Performed At</th>
                  <th>Validated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(result => (
                  <tr key={result.id}>
                    <td>
                      <code>{result.orderNumber}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">{result.patientName}</div>
                    </td>
                    <td>
                      <div className="small">{result.testName}</div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{result.fieldLabel}</div>
                        <small className="text-muted">{result.fieldName}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{result.resultText}</div>
                        {result.normalRange && (
                          <small className="text-muted">Range: {result.normalRange}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={
                        result.status === 'VALIDATED' ? 'success' :
                        result.status === 'REJECTED' || result.status === 'CANCELLED' ? 'danger' :
                        result.status === 'COMPLETED' ? 'info' : 'primary'
                      }>
                        {result.status}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{result.performedByName}</div>
                        <small className="text-muted">{result.performedBy}</small>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {new Date(result.performedAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {result.validatedAt ? new Date(result.validatedAt).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewDetails(result)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleUpdateStatus(result.id, 'VALIDATED')}
                          disabled={result.status === 'VALIDATED'}
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

      {/* Result Details Modal */}
      <ResultDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedResult(null);
        }}
        result={selectedResult}
      />
    </div>
  );
}

interface ResultDetailsModalProps {
  show: boolean;
  onHide: () => void;
  result: DiagnosticResult | null;
}

function ResultDetailsModal({ show, onHide, result }: ResultDetailsModalProps) {
  if (!result) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Result Details - {result.fieldLabel}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Order Information</div>
            <div>Order: {result.orderNumber}</div>
            <div>Patient: {result.patientName}</div>
            <div>Test: {result.testName}</div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Result Information</div>
            <div>Field: {result.fieldLabel} ({result.fieldName})</div>
            <div>Status: <Badge bg="primary">{result.status}</Badge></div>
            <div>Result: <strong>{result.resultText}</strong></div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Performance Details</div>
            <div>Performed By: {result.performedByName}</div>
            <div>Performed At: {new Date(result.performedAt).toLocaleString()}</div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Validation Details</div>
            <div>Validated By: {result.validatedByName}</div>
            <div>Validated At: {result.validatedAt ? new Date(result.validatedAt).toLocaleString() : 'Not validated'}</div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Result Details</div>
            <div>Value: {result.resultValue}</div>
            <div>Text: {result.resultText}</div>
            <div>Interpretation: {result.interpretation}</div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Reference Range</div>
            <div>Normal Range: {result.normalRange}</div>
            <div>Units: {result.units}</div>
          </Col>
        </Row>

        {result.validationNotes && (
          <div className="mb-3">
            <div className="fw-semibold">Validation Notes</div>
            <div className="text-muted">{result.validationNotes}</div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
