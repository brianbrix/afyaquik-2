import React, { useState } from 'react';
import { Button, Card, Table, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { sampleApi } from '../../../services/diagnosticsApi';

interface Sample {
  id: number;
  barcode: string;
  sampleType: string;
  status: string;
  collectedBy: string;
  collectedByName: string;
  collectedAt: string;
  receivedBy: string;
  receivedByName: string;
  receivedAt?: string;
  notes: string;
  rejectionReason?: string;
  diagnosticOrderId: number;
  orderNumber: string;
  patientName: string;
  testName: string;
}

export function SampleAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSampleType, setFilterSampleType] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  
  const queryClient = useQueryClient();

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['samples', searchTerm, filterStatus, filterSampleType, filterPatient],
    queryFn: () => sampleApi.getAll()
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log('Updating sample status:', { id, status });
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      Swal.fire('Success', 'Sample status updated successfully', 'success');
    }
  });

  const handleViewDetails = (sample: Sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    Swal.fire({
      title: 'Update Sample Status?',
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

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = !searchTerm || 
      sample.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || sample.status === filterStatus;
    const matchesSampleType = !filterSampleType || sample.sampleType === filterSampleType;
    const matchesPatient = !filterPatient || sample.patientName.toLowerCase().includes(filterPatient.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesSampleType && matchesPatient;
  });

  const statusOptions = ['PENDING', 'COLLECTED', 'RECEIVED', 'IN_PROCESS', 'COMPLETED', 'REJECTED', 'EXPIRED'];
  const sampleTypes = ['BLOOD', 'URINE', 'STOOL', 'SPUTUM', 'SWAB', 'TISSUE', 'FLUID', 'OTHER'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Sample Management</h5>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search samples..."
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
                value={filterSampleType}
                onChange={(e) => setFilterSampleType(e.target.value)}
              >
                <option value="">All Types</option>
                {sampleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                  setFilterSampleType('');
                  setFilterPatient('');
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Samples Table */}
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading samples...</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Patient</th>
                  <th>Order #</th>
                  <th>Test</th>
                  <th>Sample Type</th>
                  <th>Status</th>
                  <th>Collected By</th>
                  <th>Collected At</th>
                  <th>Received At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map(sample => (
                  <tr key={sample.id}>
                    <td>
                      <code>{sample.barcode}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">{sample.patientName}</div>
                    </td>
                    <td>
                      <code>{sample.orderNumber}</code>
                    </td>
                    <td>
                      <div className="small">{sample.testName}</div>
                    </td>
                    <td>
                      <Badge bg="info">{sample.sampleType}</Badge>
                    </td>
                    <td>
                      <Badge bg={
                        sample.status === 'COMPLETED' ? 'success' :
                        sample.status === 'REJECTED' || sample.status === 'EXPIRED' ? 'danger' :
                        sample.status === 'IN_PROCESS' ? 'warning' : 'primary'
                      }>
                        {sample.status}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{sample.collectedByName}</div>
                        <small className="text-muted">{sample.collectedBy}</small>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {new Date(sample.collectedAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {sample.receivedAt ? new Date(sample.receivedAt).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleViewDetails(sample)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleUpdateStatus(sample.id, 'RECEIVED')}
                          disabled={sample.status === 'RECEIVED' || sample.status === 'COMPLETED'}
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

      {/* Sample Details Modal */}
      <SampleDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedSample(null);
        }}
        sample={selectedSample}
      />
    </div>
  );
}

interface SampleDetailsModalProps {
  show: boolean;
  onHide: () => void;
  sample: Sample | null;
}

function SampleDetailsModal({ show, onHide, sample }: SampleDetailsModalProps) {
  if (!sample) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Sample Details - {sample.barcode}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Sample Information</div>
            <div>Barcode: <code>{sample.barcode}</code></div>
            <div>Type: <Badge bg="info">{sample.sampleType}</Badge></div>
            <div>Status: <Badge bg="primary">{sample.status}</Badge></div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Patient Information</div>
            <div>Patient: {sample.patientName}</div>
            <div>Order: {sample.orderNumber}</div>
            <div>Test: {sample.testName}</div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="fw-semibold">Collection Details</div>
            <div>Collected By: {sample.collectedByName}</div>
            <div>Collected At: {new Date(sample.collectedAt).toLocaleString()}</div>
          </Col>
          <Col md={6}>
            <div className="fw-semibold">Receipt Details</div>
            <div>Received By: {sample.receivedByName}</div>
            <div>Received At: {sample.receivedAt ? new Date(sample.receivedAt).toLocaleString() : 'Not received'}</div>
          </Col>
        </Row>

        {sample.notes && (
          <div className="mb-3">
            <div className="fw-semibold">Notes</div>
            <div className="text-muted">{sample.notes}</div>
          </div>
        )}

        {sample.rejectionReason && (
          <div className="mb-3">
            <div className="fw-semibold text-danger">Rejection Reason</div>
            <div className="text-danger">{sample.rejectionReason}</div>
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
