import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { conflictResolutionService, ConflictData, ConflictResolution } from '../../services/conflictResolutionService';

interface ConflictResolutionModalProps {
  show: boolean;
  onHide: () => void;
  conflict: ConflictData | null;
  onResolve: (resolution: ConflictResolution) => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  show,
  onHide,
  conflict,
  onResolve
}) => {
  const [selectedResolution, setSelectedResolution] = useState<string>('');
  const [mergedData, setMergedData] = useState<any>(null);
  const [resolutionReason, setResolutionReason] = useState<string>('');

  useEffect(() => {
    if (conflict) {
      setSelectedResolution('');
      setMergedData(null);
      setResolutionReason('');
    }
  }, [conflict]);

  if (!conflict) {
    return null;
  }

  const handleResolve = () => {
    if (!selectedResolution) {
      alert('Please select a resolution strategy');
      return;
    }

    const resolution: ConflictResolution = {
      id: '',
      resolution: selectedResolution as any,
      mergedData: mergedData,
      reason: resolutionReason,
      resolvedBy: 'user',
      resolvedAt: Date.now()
    };

    onResolve(resolution);
    onHide();
  };

  const handleAutoResolve = () => {
    const autoResolution = conflictResolutionService.autoResolveConflict(conflict.id);
    if (autoResolution) {
      onResolve(autoResolution);
      onHide();
    } else {
      alert('Cannot auto-resolve this conflict. Please choose a manual resolution.');
    }
  };

  const renderDataComparison = () => {
    const { localData, serverData } = conflict;
    
    return (
      <Row>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Local Data</h6>
            </Card.Header>
            <Card.Body>
              <pre className="mb-0" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(localData, null, 2)}
              </pre>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">Server Data</h6>
            </Card.Header>
            <Card.Body>
              <pre className="mb-0" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(serverData, null, 2)}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderResolutionOptions = () => {
    return (
      <div className="mt-3">
        <h6>Resolution Strategy:</h6>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="resolution"
            id="useLocal"
            value="use_local"
            checked={selectedResolution === 'use_local'}
            onChange={(e) => setSelectedResolution(e.target.value)}
          />
          <label className="form-check-label" htmlFor="useLocal">
            <strong>Use Local Data</strong> - Keep your local changes
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="resolution"
            id="useServer"
            value="use_server"
            checked={selectedResolution === 'use_server'}
            onChange={(e) => setSelectedResolution(e.target.value)}
          />
          <label className="form-check-label" htmlFor="useServer">
            <strong>Use Server Data</strong> - Accept server changes
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="resolution"
            id="merge"
            value="merge"
            checked={selectedResolution === 'merge'}
            onChange={(e) => setSelectedResolution(e.target.value)}
          />
          <label className="form-check-label" htmlFor="merge">
            <strong>Merge Data</strong> - Combine both versions
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="resolution"
            id="manual"
            value="manual"
            checked={selectedResolution === 'manual'}
            onChange={(e) => setSelectedResolution(e.target.value)}
          />
          <label className="form-check-label" htmlFor="manual">
            <strong>Manual Resolution</strong> - Create custom resolution
          </label>
        </div>
      </div>
    );
  };

  const renderResolutionReason = () => {
    return (
      <div className="mt-3">
        <label htmlFor="resolutionReason" className="form-label">
          Resolution Reason (Optional):
        </label>
        <textarea
          className="form-control"
          id="resolutionReason"
          rows={3}
          value={resolutionReason}
          onChange={(e) => setResolutionReason(e.target.value)}
          placeholder="Explain why you chose this resolution..."
        />
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Badge bg="warning" className="me-2">Conflict</Badge>
          Resolve Data Conflict
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="mb-3">
          <strong>Conflict Detected:</strong> {conflict.conflictReason}
        </Alert>

        <div className="mb-3">
          <h6>Entity: {conflict.entityType} (ID: {conflict.entityId})</h6>
          <small className="text-muted">
            Detected at: {new Date(conflict.timestamp).toLocaleString()}
          </small>
        </div>

        {renderDataComparison()}
        {renderResolutionOptions()}
        {renderResolutionReason()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="info" onClick={handleAutoResolve}>
          Auto-Resolve
        </Button>
        <Button 
          variant="primary" 
          onClick={handleResolve}
          disabled={!selectedResolution}
        >
          Resolve Conflict
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConflictResolutionModal;


