import React from 'react';
import { Card, Row, Col, Table, Badge, Alert, ProgressBar, Button, ButtonGroup } from 'react-bootstrap';
import { ReportResponse } from '../../../services/reportsApi';

interface UserActivityReportViewerProps {
  report: ReportResponse;
  onExport?: (format: string) => void;
}

export function UserActivityReportViewer({ report, onExport }: UserActivityReportViewerProps) {
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return String(timestamp);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'LOGIN': 'success',
      'LOGOUT': 'secondary',
      'CREATE': 'primary',
      'UPDATE': 'warning',
      'DELETE': 'danger',
      'VIEW': 'info',
      'EXPORT': 'dark'
    };
    return (
      <Badge bg={actionColors[action] || 'secondary'}>
        {action}
      </Badge>
    );
  };

  const getActivityLevel = (count: number) => {
    if (count >= 100) return { variant: 'success', label: 'Very Active' };
    if (count >= 50) return { variant: 'info', label: 'Active' };
    if (count >= 20) return { variant: 'warning', label: 'Moderate' };
    return { variant: 'secondary', label: 'Low' };
  };

  return (
    <div>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{report.summary.totalRecords}</h4>
              <p className="text-muted mb-0">Total Actions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">
                {report.summary.totalRecords > 0 ? 'Active User' : 'No Activity'}
              </h4>
              <p className="text-muted mb-0">Activity Status</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">
                {report.summary.totalRecords > 0 
                  ? Math.round(report.summary.totalRecords / 7) 
                  : 0}
              </h4>
              <p className="text-muted mb-0">Avg Daily Actions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">{report.summary.dateRange}</h4>
              <p className="text-muted mb-0">Date Range</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Sections */}
      {report.sections.map((section, index) => (
        <Card key={index} className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{section.sectionTitle}</h5>
            <small className="text-muted">{section.description}</small>
          </Card.Header>
          <Card.Body>
            {section.data && section.data.length > 0 ? (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Count</th>
                    <th>Activity Level</th>
                    <th>Timestamp</th>
                    <th>Endpoint</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((item, itemIndex) => {
                    const activityLevel = getActivityLevel(Number(item.value));
                    return (
                      <tr key={itemIndex}>
                        <td>
                          {getActionBadge(item.label.replace('Action: ', ''))}
                        </td>
                        <td>
                          <strong>{Number(item.value).toLocaleString()}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <ProgressBar
                              variant={activityLevel.variant}
                              now={Math.min(Number(item.value), 100)}
                              style={{ width: '60px', height: '8px' }}
                              className="me-2"
                            />
                            <small className="text-muted">
                              {activityLevel.label}
                            </small>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatTimestamp(item.attributes?.timestamp)}
                          </small>
                        </td>
                        <td>
                          <code className="text-primary">
                            {item.attributes?.details || 'N/A'}
                          </code>
                        </td>
                        <td>
                          <small className="text-muted">
                            {item.attributes && Object.entries(item.attributes)
                              .filter(([key]) => !['timestamp', 'details'].includes(key))
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info" className="text-center">
                <p className="mb-0">No activity data available for the selected period</p>
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Export Options */}
      {onExport && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">Export User Activity Report</h6>
            <small className="text-muted">Download report in various formats</small>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-center">
              <ButtonGroup>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onExport('PDF')}
                >
                  PDF
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => onExport('EXCEL')}
                >
                  Excel
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => onExport('CSV')}
                >
                  CSV
                </Button>
              </ButtonGroup>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
