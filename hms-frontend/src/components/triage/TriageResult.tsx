import React from 'react';
import { Card, Badge, Alert, Row, Col, Table } from 'react-bootstrap';
import { TriageEntry } from '../../services/triageItemApi';
import { FaCalculator, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface TriageResultProps {
  entries: TriageEntry[];
  showCalculations?: boolean;
  showAssessment?: boolean;
}

export const TriageResult: React.FC<TriageResultProps> = ({ 
  entries, 
  showCalculations = true, 
  showAssessment = true 
}) => {
  const getStatusIcon = (entry: TriageEntry) => {
    if (entry.isCritical) {
      return <FaTimesCircle className="text-danger" />;
    }
    if (entry.isWarning) {
      return <FaExclamationTriangle className="text-warning" />;
    }
    if (entry.isAbnormal) {
      return <FaExclamationTriangle className="text-warning" />;
    }
    if (entry.isNormal) {
      return <FaCheckCircle className="text-success" />;
    }
    return null;
  };

  const getStatusBadge = (entry: TriageEntry) => {
    const variant = entry.statusColor === 'danger' ? 'danger' : 
                   entry.statusColor === 'warning' ? 'warning' : 
                   entry.statusColor === 'success' ? 'success' : 'secondary';
    
    return <Badge bg={variant}>{entry.statusText}</Badge>;
  };

  const getCalculationBadge = (entry: TriageEntry) => {
    if (entry.calculatedValue !== undefined) {
      return (
        <Badge bg="info">
          <FaCalculator className="me-1" />
          Calculated: {entry.calculatedValue.toFixed(2)}
        </Badge>
      );
    }
    return null;
  };

  const getCriticalEntries = () => {
    return entries.filter(entry => entry.isCritical);
  };

  const getWarningEntries = () => {
    return entries.filter(entry => entry.isWarning && !entry.isCritical);
  };

  const getAbnormalEntries = () => {
    return entries.filter(entry => entry.isAbnormal && !entry.isWarning && !entry.isCritical);
  };

  const getNormalEntries = () => {
    return entries.filter(entry => entry.isNormal);
  };

  const criticalEntries = getCriticalEntries();
  const warningEntries = getWarningEntries();
  const abnormalEntries = getAbnormalEntries();
  const normalEntries = getNormalEntries();

  return (
    <div className="triage-result">
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-danger">{criticalEntries.length}</h5>
              <p className="mb-0">Critical</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-warning">{warningEntries.length}</h5>
              <p className="mb-0">Warning</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-warning">{abnormalEntries.length}</h5>
              <p className="mb-0">Abnormal</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{normalEntries.length}</h5>
              <p className="mb-0">Normal</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Critical Entries Alert */}
      {criticalEntries.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>
            <FaTimesCircle className="me-2" />
            Critical Values Detected
          </Alert.Heading>
          <p>The following triage items have critical values that require immediate attention:</p>
          <ul className="mb-0">
            {criticalEntries.map(entry => (
              <li key={entry.id}>
                <strong>{entry.triageItemName}</strong>: {entry.displayValue} {entry.triageItemUnit}
                {entry.assessmentNotes && (
                  <div className="small text-muted mt-1">{entry.assessmentNotes}</div>
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Warning Entries Alert */}
      {warningEntries.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>
            <FaExclamationTriangle className="me-2" />
            Warning Values Detected
          </Alert.Heading>
          <p>The following triage items have warning values:</p>
          <ul className="mb-0">
            {warningEntries.map(entry => (
              <li key={entry.id}>
                <strong>{entry.triageItemName}</strong>: {entry.displayValue} {entry.triageItemUnit}
                {entry.assessmentNotes && (
                  <div className="small text-muted mt-1">{entry.assessmentNotes}</div>
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Detailed Results Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Triage Results</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>Item</th>
                <th>Value</th>
                <th>Status</th>
                {showCalculations && <th>Calculations</th>}
                {showAssessment && <th>Assessment</th>}
                <th>Nurse Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div>
                      <strong>{entry.triageItemName}</strong>
                      <div className="small text-muted">
                        {entry.triageItemCategory} • {entry.triageItemUnit}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="fw-bold">{entry.displayValue}</span>
                      {entry.triageItemUnit && (
                        <span className="text-muted ms-1">{entry.triageItemUnit}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {getStatusIcon(entry)}
                      <span className="ms-2">{getStatusBadge(entry)}</span>
                    </div>
                  </td>
                  {showCalculations && (
                    <td>
                      {getCalculationBadge(entry)}
                      {entry.calculationResult && (
                        <div className="small text-muted mt-1">
                          <code>{entry.calculationResult}</code>
                        </div>
                      )}
                    </td>
                  )}
                  {showAssessment && (
                    <td>
                      {entry.assessmentNotes && (
                        <div className="small">
                          {entry.assessmentNotes}
                        </div>
                      )}
                    </td>
                  )}
                  <td>
                    {entry.nurseNotes && (
                      <div className="small">
                        {entry.nurseNotes}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Calculations Summary */}
      {showCalculations && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">
              <FaCalculator className="me-2" />
              Calculation Summary
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Calculated Values</h6>
                <ul className="list-unstyled">
                  {entries
                    .filter(entry => entry.calculatedValue !== undefined)
                    .map(entry => (
                      <li key={entry.id} className="mb-2">
                        <strong>{entry.triageItemName}</strong>: {entry.calculatedValue?.toFixed(2)}
                        {entry.triageItemUnit && ` ${entry.triageItemUnit}`}
                      </li>
                    ))}
                </ul>
              </Col>
              <Col md={6}>
                <h6>Raw Values</h6>
                <ul className="list-unstyled">
                  {entries
                    .filter(entry => entry.calculatedValue === undefined)
                    .map(entry => (
                      <li key={entry.id} className="mb-2">
                        <strong>{entry.triageItemName}</strong>: {entry.displayValue}
                        {entry.triageItemUnit && ` ${entry.triageItemUnit}`}
                      </li>
                    ))}
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

