import React, { useState } from 'react';
import { Modal, Table, Badge, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { prescriptionAuditApi, PrescriptionAudit } from '../../services/prescriptionAuditApi';

interface PrescriptionAuditTrailProps {
  show: boolean;
  onHide: () => void;
  prescriptionId: number;
  prescriptionNumber: string;
}

export const PrescriptionAuditTrail: React.FC<PrescriptionAuditTrailProps> = ({
  show,
  onHide,
  prescriptionId,
  prescriptionNumber
}) => {
  const [selectedAudit, setSelectedAudit] = useState<PrescriptionAudit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: auditTrail = [], isLoading, error } = useQuery({
    queryKey: ['prescription-audit', prescriptionId],
    queryFn: () => prescriptionAuditApi.getPrescriptionAuditTrail(prescriptionId),
    enabled: show && !!prescriptionId
  });

  const getActionTypeBadge = (actionType: string) => {
    const variants: Record<string, string> = {
      'CREATED': 'success',
      'UPDATED': 'primary',
      'DISPENSED': 'info',
      'PARTIALLY_DISPENSED': 'warning',
      'CANCELLED': 'danger',
      'REVERSED': 'secondary',
      'REPLACED': 'dark',
      'EXPIRED': 'danger',
      'STATUS_CHANGED': 'primary'
    };
    return variants[actionType] || 'secondary';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, string> = {
      'DRAFT': 'secondary',
      'PENDING': 'warning',
      'PARTIALLY_DISPENSED': 'info',
      'DISPENSED': 'success',
      'CANCELLED': 'danger',
      'EXPIRED': 'danger',
      'REPLACED': 'dark',
      'REVERSED': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (audit: PrescriptionAudit) => {
    setSelectedAudit(audit);
    setShowDetailsModal(true);
  };

  const parsePrescriptionData = (data?: string) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-clock-history me-2"></i>
            Prescription Audit Trail - {prescriptionNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading audit trail...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">
              Failed to load audit trail. Please try again.
            </Alert>
          ) : auditTrail.length === 0 ? (
            <Alert variant="info">
              No audit trail entries found for this prescription.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Status Change</th>
                    <th>User</th>
                    <th>Date/Time</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTrail.map((audit) => (
                    <tr key={audit.id}>
                      <td>
                        <Badge bg={getActionTypeBadge(audit.actionType)}>
                          {audit.actionType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        {audit.previousStatus && audit.newStatus ? (
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={getStatusBadge(audit.previousStatus)}>
                              {audit.previousStatus}
                            </Badge>
                            <i className="bi bi-arrow-right"></i>
                            <Badge bg={getStatusBadge(audit.newStatus)}>
                              {audit.newStatus}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{audit.actionBy}</div>
                          <small className="text-muted">v{audit.id}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{formatDateTime(audit.actionAt)}</div>
                          <small className="text-muted">
                            {new Date(audit.actionAt).toLocaleDateString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {audit.reason || '—'}
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(audit)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Audit Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Audit Entry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAudit && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <Card>
                    <Card.Header>Action Details</Card.Header>
                    <Card.Body>
                      <div><strong>Action:</strong> {selectedAudit.actionType}</div>
                      <div><strong>User:</strong> {selectedAudit.actionBy}</div>
                      <div><strong>Date:</strong> {formatDateTime(selectedAudit.actionAt)}</div>
                      {selectedAudit.reason && (
                        <div><strong>Reason:</strong> {selectedAudit.reason}</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>Status Change</Card.Header>
                    <Card.Body>
                      {selectedAudit.previousStatus && selectedAudit.newStatus ? (
                        <div>
                          <div>
                            <strong>From:</strong>{' '}
                            <Badge bg={getStatusBadge(selectedAudit.previousStatus)}>
                              {selectedAudit.previousStatus}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <strong>To:</strong>{' '}
                            <Badge bg={getStatusBadge(selectedAudit.newStatus)}>
                              {selectedAudit.newStatus}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted">No status change</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {selectedAudit.changesSummary && (
                <Card className="mb-3">
                  <Card.Header>Changes Summary</Card.Header>
                  <Card.Body>
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedAudit.changesSummary}
                    </pre>
                  </Card.Body>
                </Card>
              )}

              {selectedAudit.prescriptionData && (
                <Card>
                  <Card.Header>Prescription Data Snapshot</Card.Header>
                  <Card.Body>
                    <pre className="mb-0" style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '0.875rem',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {JSON.stringify(parsePrescriptionData(selectedAudit.prescriptionData), null, 2)}
                    </pre>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
