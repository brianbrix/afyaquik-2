import React, { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { fetchTriageEntries } from '../../services/triageEntriesApi';
import { fetchConsultationEntries } from '../../services/consultationEntriesApi';

interface PreviousStaffNotesModalProps {
  show: boolean;
  onHide: () => void;
  queueItemId: number;
  patientName: string;
}

interface TriageEntry {
  id: number;
  title: string;
  details: string;
  createdAt: string;
  createdBy: string;
}

interface ConsultationEntry {
  id: number;
  title: string;
  details: string;
  createdAt: string;
  createdBy: string;
}

export const PreviousStaffNotesModal: React.FC<PreviousStaffNotesModalProps> = ({
  show,
  onHide,
  queueItemId,
  patientName
}) => {
  const [activeTab, setActiveTab] = useState('triage');
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>([]);
  const [consultationEntries, setConsultationEntries] = useState<ConsultationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && queueItemId) {
      loadPreviousNotes();
    }
  }, [show, queueItemId]);

  const loadPreviousNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load triage entries
      const triageData = await fetchTriageEntries(queueItemId);
      setTriageEntries(triageData);

      // Load consultation entries
      const consultationData = await fetchConsultationEntries(queueItemId);
      setConsultationEntries(consultationData);
    } catch (err) {
      setError('Failed to load previous notes');
      console.error('Error loading previous notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderEntries = (entries: (TriageEntry | ConsultationEntry)[], type: string) => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <div className="mt-2">Loading {type} notes...</div>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-muted text-center py-4">
          <i className="bi bi-clipboard-x me-2"></i>
          No {type} notes found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <Card key={entry.id} className="mb-3">
            <Card.Header className="py-2 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="info" className="me-2">{type}</Badge>
                <strong>{entry.title}</strong>
              </div>
              <small className="text-muted">
                {formatDate(entry.createdAt)}
              </small>
            </Card.Header>
            <Card.Body className="py-3">
              <div 
                className="previous-notes-content"
                dangerouslySetInnerHTML={{ __html: entry.details }}
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-person me-1"></i>
                  Created by: {entry.createdBy}
                </small>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-clipboard-data me-2"></i>
          Previous Staff Notes - {patientName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {error && (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        )}
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'triage')}
          className="px-3 pt-3"
        >
          <Tab eventKey="triage" title={`Triage (${triageEntries.length})`}>
            <div className="p-3">
              <div className="mb-3">
                <h6 className="text-muted">
                  <i className="bi bi-clipboard-pulse me-2"></i>
                  Triage Assessment Notes
                </h6>
                <p className="small text-muted mb-0">
                  Initial patient assessment and triage decisions made by triage staff.
                </p>
              </div>
              {renderEntries(triageEntries, 'Triage')}
            </div>
          </Tab>
          
          <Tab eventKey="consultation" title={`Consultation (${consultationEntries.length})`}>
            <div className="p-3">
              <div className="mb-3">
                <h6 className="text-muted">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Consultation Notes
                </h6>
                <p className="small text-muted mb-0">
                  Medical consultation and treatment decisions made by healthcare providers.
                </p>
              </div>
              {renderEntries(consultationEntries, 'Consultation')}
            </div>
          </Tab>
          
          <Tab eventKey="summary" title="Summary">
            <div className="p-3">
              <div className="mb-3">
                <h6 className="text-muted">
                  <i className="bi bi-list-ul me-2"></i>
                  Patient Care Summary
                </h6>
                <p className="small text-muted mb-0">
                  Overview of all previous staff interactions and decisions.
                </p>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Header className="py-2">
                      <strong>Triage Summary</strong>
                    </Card.Header>
                    <Card.Body className="py-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Items:</span>
                        <Badge bg="info">{triageEntries.length}</Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Latest:</span>
                        <small className="text-muted">
                          {triageEntries.length > 0 
                            ? formatDate(triageEntries[triageEntries.length - 1].createdAt)
                            : 'None'
                          }
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Header className="py-2">
                      <strong>Consultation Summary</strong>
                    </Card.Header>
                    <Card.Body className="py-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Items:</span>
                        <Badge bg="success">{consultationEntries.length}</Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Latest:</span>
                        <small className="text-muted">
                          {consultationEntries.length > 0 
                            ? formatDate(consultationEntries[consultationEntries.length - 1].createdAt)
                            : 'None'
                          }
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onHide}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};
