import React from 'react';
import { Card, Row, Col, Table, Badge, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { ReportResponse } from '../../../services/reportsApi';

interface BillingReportViewerProps {
  report: ReportResponse;
  onExport?: (format: string) => void;
}

export function BillingReportViewer({ report, onExport }: BillingReportViewerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'PAID': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'REFUNDED': 'info'
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
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{report.summary.totalRecords}</h4>
              <p className="text-muted mb-0">Total Bills</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">
                {report.summary.totalAmount ? formatCurrency(report.summary.totalAmount) : '$0.00'}
              </h4>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">
                {report.summary.totalAmount && report.summary.totalRecords 
                  ? formatCurrency(report.summary.totalAmount / report.summary.totalRecords)
                  : '$0.00'}
              </h4>
              <p className="text-muted mb-0">Average Bill</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
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
                    <th>Bill Number</th>
                    <th>Amount</th>
                    <th>Patient</th>
                    <th>Status</th>
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
                        <span className="fw-bold text-success">
                          {formatCurrency(Number(item.value))}
                        </span>
                      </td>
                      <td>
                        {item.attributes?.patient || 'N/A'}
                      </td>
                      <td>
                        {getStatusBadge(item.attributes?.status || 'UNKNOWN')}
                      </td>
                      <td>
                        <small className="text-muted">
                          {item.attributes && Object.entries(item.attributes)
                            .filter(([key]) => !['patient', 'status'].includes(key))
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
                <p className="mb-0">No billing data available for the selected period</p>
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Export Options */}
      {onExport && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">Export Billing Report</h6>
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
