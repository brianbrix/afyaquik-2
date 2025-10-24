import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, InputGroup, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { TriageInput } from './TriageInput';
import { TriageResult } from './TriageResult';
import { triageItemApi, triageEntryApi, TriageItem, TriageEntry } from '../../services/triageItemApi';
import { FaThermometerHalf, FaHeartbeat, FaTint, FaLungs, FaExclamationTriangle } from 'react-icons/fa';

interface TriageActionsSectionProps {
  queueItemId: number;
  patientId: number;
  staffId: number;
  isReadonly?: boolean;
}

export const TriageActionsSection: React.FC<TriageActionsSectionProps> = ({ 
  queueItemId, 
  patientId, 
  staffId, 
  isReadonly = false 
}) => {
  const [triageItems, setTriageItems] = useState<TriageItem[]>([]);
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');

  useEffect(() => {
    loadTriageData();
  }, [patientId]);

  const loadTriageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load triage items and entries in parallel
      const [items, entries] = await Promise.all([
        triageItemApi.getActiveTriageItems(),
        triageEntryApi.getTriageEntriesForPatient(patientId)
      ]);
      
      setTriageItems(items);
      setTriageEntries(entries);
    } catch (err) {
      setError('Failed to load triage data');
      console.error('Error loading triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryCreated = async (entries: TriageEntry[]) => {
    // Refresh the entries list
    await loadTriageData();
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Triage Assessment Complete',
      text: `${entries.length} triage entries have been recorded.`,
      confirmButtonText: 'OK'
    });
    
    // Switch to results tab
    setActiveTab('results');
  };

  const handleError = (error: string) => {
    setError(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error,
      confirmButtonText: 'OK'
    });
  };

  const getCriticalCount = () => {
    return triageEntries.filter(entry => entry.isCritical).length;
  };

  const getWarningCount = () => {
    return triageEntries.filter(entry => entry.isWarning).length;
  };

  const getAbnormalCount = () => {
    return triageEntries.filter(entry => entry.isAbnormal).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="fw-semibold mb-2">Triage Assessment</div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Summary */}
      {triageEntries.length > 0 && (
        <Card className="mb-3">
          <Card.Body className="p-2">
            <Row className="text-center">
              <Col md={3}>
                <div className="text-danger fw-bold fs-4">{getCriticalCount()}</div>
                <div className="small text-muted">Critical</div>
              </Col>
              <Col md={3}>
                <div className="text-warning fw-bold fs-4">{getWarningCount()}</div>
                <div className="small text-muted">Warning</div>
              </Col>
              <Col md={3}>
                <div className="text-warning fw-bold fs-4">{getAbnormalCount()}</div>
                <div className="small text-muted">Abnormal</div>
              </Col>
              <Col md={3}>
                <div className="text-success fw-bold fs-4">{triageEntries.length - getCriticalCount() - getWarningCount() - getAbnormalCount()}</div>
                <div className="small text-muted">Normal</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="d-flex mb-3">
        <Button
          variant={activeTab === 'input' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('input')}
          className="me-2"
        >
          <FaThermometerHalf className="me-1" />
          Triage Input
        </Button>
        <Button
          variant={activeTab === 'results' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('results')}
          disabled={triageEntries.length === 0}
        >
          <FaExclamationTriangle className="me-1" />
          Results & Notes
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'input' && (
        <TriageInput
          patientId={patientId}
          staffId={staffId}
          queueItemId={queueItemId}
          onEntryCreated={handleEntryCreated}
          onError={handleError}
        />
      )}

      {activeTab === 'results' && triageEntries.length > 0 && (
        <TriageResult
          entries={triageEntries}
          showCalculations={true}
          showAssessment={true}
        />
      )}

      {activeTab === 'results' && triageEntries.length === 0 && (
        <Alert variant="info">
          <FaThermometerHalf className="me-2" />
          No triage entries found. Please complete the triage assessment first.
        </Alert>
      )}
    </div>
  );
};
