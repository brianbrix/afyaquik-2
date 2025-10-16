import React from 'react';
import { Card, Row, Col, Table, Badge, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { ReportResponse } from '../../../services/reportsApi';

interface QueueReportViewerProps {
  report: ReportResponse;
  onExport?: (format: string) => void;
}

export function QueueReportViewer({ report, onExport }: QueueReportViewerProps) {
  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return <Badge bg="danger">High</Badge>;
    if (priority >= 5) return <Badge bg="warning">Medium</Badge>;
    return <Badge bg="success">Low</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'WAITING': 'warning',
      'IN_PROGRESS': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'ON_HOLD': 'secondary'
    };
    return (
      <Badge bg={statusColors[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{report.summary.totalRecords}</h4>
              <p className="text-muted mb-0">Total Queue Items</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">
                {report.summary.totalRecords > 0 ? 'Active' : 'No Items'}
              </h4>
              <p className="text-muted mb-0">Queue Status</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{report.summary.dateRange}</h4>
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
                    <th>Queue Item</th>
                    <th>Priority</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Department</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td>
                        <strong>{item.label}</strong>
                      </td>
                      <td>
                        {getPriorityBadge(Number(item.value))}
                      </td>
                      <td>
                        {item.attributes?.patient || 'N/A'}
                      </td>
                      <td>
                        {getStatusBadge(item.attributes?.status || 'UNKNOWN')}
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {item.attributes?.department || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {item.attributes && Object.entries(item.attributes)
                            .filter(([key]) => !['patient', 'status', 'department'].includes(key))
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info" className="text-center">
                <p className="mb-0">No queue items available for the selected period</p>
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Export Options */}
      {onExport && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">Export Queue Report</h6>
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
