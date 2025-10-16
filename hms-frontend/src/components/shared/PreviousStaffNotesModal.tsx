import React, { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { fetchTriageEntries } from '../../services/triageEntriesApi';
import { fetchConsultationEntries } from '../../services/consultationEntriesApi';
import { queuePrescriptionApi } from '../../services/pharmacyApi';

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
  consultationTitleId?: number;
  consultationTitleName?: string;
  consultationTitleLevel?: number;
  isCustom?: boolean;
  sortOrder?: number;
}

interface PrescriptionEntry {
  id: number;
  prescriptionNumber: string;
  status: string;
  notes?: string;
  totalAmount?: number;
  prescribedByName: string;
  prescriptionDate: string;
  items: PrescriptionItemEntry[];
}

interface PrescriptionItemEntry {
  id: number;
  medicationName: string;
  quantityPrescribed: number;
  dosageInstructions: string;
  frequency: string;
  durationDays?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
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
  const [prescriptionEntries, setPrescriptionEntries] = useState<PrescriptionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

      // Load prescription entries
      const prescriptionData = await queuePrescriptionApi.getByQueueItem(queueItemId);
      setPrescriptionEntries(prescriptionData);
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

  const handleTabChange = (tabKey: string | null) => {
    if (tabKey && tabKey !== activeTab) {
      setIsTransitioning(true);
      // Add a small delay for smooth transition
      setTimeout(() => {
        setActiveTab(tabKey);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const renderPrescriptionEntries = (entries: PrescriptionEntry[]) => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <div className="mt-2">Loading prescription notes...</div>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-muted text-center py-4">
          <i className="bi bi-capsule me-2"></i>
          No prescription notes found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((prescription) => (
          <Card key={prescription.id} className="mb-3">
            <Card.Header className="py-2 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="success" className="me-2">Pharmacy</Badge>
                <strong>{prescription.prescriptionNumber}</strong>
                <Badge bg={prescription.status === 'DISPENSED' ? 'success' : 'warning'} className="ms-2">
                  {prescription.status}
                </Badge>
              </div>
              <small className="text-muted">
                {formatDate(prescription.prescriptionDate)}
              </small>
            </Card.Header>
            <Card.Body className="py-3">
              <div className="mb-3">
                <strong>Prescribed by:</strong> {prescription.prescribedByName}
              </div>
              
              {prescription.notes && (
                <div className="mb-3">
                  <strong>Notes:</strong>
                  <div 
                    className="previous-notes-content mt-1"
                    dangerouslySetInnerHTML={{ __html: prescription.notes }}
                    style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      padding: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
              )}
              
              <div className="mb-3">
                <strong>Medications:</strong>
                <div className="mt-2">
                  {prescription.items.map((item, index) => (
                    <div key={item.id} className="border rounded p-2 mb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{item.medicationName}</strong>
                          <div className="small text-muted">
                            {item.dosageInstructions} • {item.frequency}
                            {item.durationDays && ` • ${item.durationDays} days`}
                          </div>
                          <div className="small">
                            Quantity: {item.quantityPrescribed}
                            {item.unitPrice && ` • Unit Price: $${item.unitPrice}`}
                            {item.totalPrice && ` • Total: $${item.totalPrice}`}
                          </div>
                          {item.notes && (
                            <div className="small text-muted mt-1">
                              <em>{item.notes}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {prescription.totalAmount && (
                <div className="text-end">
                  <strong>Total Amount: ${prescription.totalAmount}</strong>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    );
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

  const renderConsultationEntriesHierarchically = (entries: ConsultationEntry[]) => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <div className="mt-2">Loading consultation notes...</div>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-muted text-center py-4">
          <i className="bi bi-clipboard-x me-2"></i>
          No consultation notes found
        </div>
      );
    }

    // Group entries by consultation title hierarchy
    const groupedEntries = entries.reduce((groups, entry) => {
      const key = entry.consultationTitleId || 'custom';
      if (!groups[key]) {
        groups[key] = {
          title: entry.consultationTitleName || 'Custom Notes',
          level: entry.consultationTitleLevel || 0,
          entries: []
        };
      }
      groups[key].entries.push(entry);
      return groups;
    }, {} as Record<string, { title: string; level: number; entries: ConsultationEntry[] }>);

    // Sort groups by level and title
    const sortedGroups = Object.values(groupedEntries).sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.title.localeCompare(b.title);
    });

    return (
      <div className="space-y-4">
        {sortedGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="consultation-group">
            <div className="d-flex align-items-center mb-3">
              <div className="flex-grow-1">
                <h6 className="mb-1 text-primary">
                  <i className={`bi bi-${group.level === 1 ? 'folder' : group.level === 2 ? 'folder2' : 'folder2-open'} me-2`}></i>
                  {group.title}
                </h6>
                <small className="text-muted">
                  Level {group.level} • {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                </small>
              </div>
            </div>
            
            <div className="ms-4">
              {group.entries
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((entry, entryIndex) => (
                <Card key={entry.id} className="mb-3 border-start border-primary border-3">
                  <Card.Header className="py-2 d-flex justify-content-between align-items-center bg-light">
                    <div>
                      <Badge bg="primary" className="me-2">Consultation</Badge>
                      <strong>{entry.title}</strong>
                      {entry.isCustom && (
                        <Badge bg="secondary" className="ms-2">Custom</Badge>
                      )}
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
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <style>{`
        .nav-pills .nav-link {
          transition: all 0.3s ease-in-out;
          border-radius: 8px;
          margin-right: 4px;
        }
        .nav-pills .nav-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }
        .tab-content {
          min-height: 300px;
        }
      `}</style>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-clipboard-data me-2"></i>
          Previous Staff Notes - {patientName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 position-relative">
        {error && (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        )}
        
        {/* Transition overlay */}
        {isTransitioning && (
          <div 
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              zIndex: 10,
              top: 0,
              left: 0
            }}
          >
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading...</span>
            </div>
          </div>
        )}
        
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="px-3 pt-3"
          style={{
            transition: 'all 0.3s ease-in-out'
          }}
          variant="pills"
        >
          <Tab eventKey="triage" title={`Triage (${triageEntries.length})`}>
            <div 
              className="p-3"
              style={{
                opacity: isTransitioning ? 0.7 : 1,
                transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
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
            <div 
              className="p-3"
              style={{
                opacity: isTransitioning ? 0.7 : 1,
                transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <div className="mb-3">
                <h6 className="text-muted">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Consultation Notes
                </h6>
                <p className="small text-muted mb-0">
                  Medical consultation and treatment decisions made by healthcare providers.
                </p>
              </div>
              {renderConsultationEntriesHierarchically(consultationEntries)}
            </div>
          </Tab>
          
          <Tab eventKey="pharmacy" title={`Pharmacy (${prescriptionEntries.length})`}>
            <div 
              className="p-3"
              style={{
                opacity: isTransitioning ? 0.7 : 1,
                transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <div className="mb-3">
                <h6 className="text-muted">
                  <i className="bi bi-capsule me-2"></i>
                  Prescription Notes
                </h6>
                <p className="small text-muted mb-0">
                  Medications prescribed and dispensed by pharmacy staff.
                </p>
              </div>
              {renderPrescriptionEntries(prescriptionEntries)}
            </div>
          </Tab>
          
          <Tab eventKey="summary" title="Summary">
            <div 
              className="p-3"
              style={{
                opacity: isTransitioning ? 0.7 : 1,
                transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
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
