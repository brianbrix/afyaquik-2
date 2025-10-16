import React from 'react';
import { Card, Button, Row, Col, Table, Badge, ButtonGroup } from 'react-bootstrap';
import { ReportResponse } from '../../../services/reportsApi';
import { BillingReportViewer } from './BillingReportViewer';
import { QueueReportViewer } from './QueueReportViewer';
import { UserActivityReportViewer } from './UserActivityReportViewer';

interface ReportViewerProps {
  report: ReportResponse;
  onExport: (format: string) => void;
}

export function ReportViewer({ report, onExport }: ReportViewerProps) {
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Use specialized viewers for specific report types
  if (report.reportType === 'BILLING') {
    return <BillingReportViewer report={report} onExport={onExport} />;
  }

  if (report.reportType === 'QUEUE') {
    return <QueueReportViewer report={report} onExport={onExport} />;
  }

  if (report.reportType === 'USER_ACTIVITY') {
    return <UserActivityReportViewer report={report} onExport={onExport} />;
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'COMPLETED': 'success',
      'PENDING': 'warning',
      'FAILED': 'danger',
      'PROCESSING': 'info'
    };
    return (
      <Badge bg={statusColors[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{report.title}</h5>
          <small className="text-muted">
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </small>
        </div>
        <div>
          {getStatusBadge(report.status)}
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Report Summary */}
        <Row className="mb-4">
          <Col md={3}>
            <div className="text-center">
              <h4 className="text-primary">{report.summary.totalRecords.toLocaleString()}</h4>
              <p className="text-muted mb-0">Total Records</p>
            </div>
          </Col>
          {report.summary.totalAmount && (
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-success">${report.summary.totalAmount.toLocaleString()}</h4>
                <p className="text-muted mb-0">Total Amount</p>
              </div>
            </Col>
          )}
          {report.summary.totalPatients && (
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-info">{report.summary.totalPatients.toLocaleString()}</h4>
                <p className="text-muted mb-0">Total Patients</p>
              </div>
            </Col>
          )}
          {report.summary.totalUsers && (
            <Col md={3}>
              <div className="text-center">
                <h4 className="text-warning">{report.summary.totalUsers.toLocaleString()}</h4>
                <p className="text-muted mb-0">Total Users</p>
              </div>
            </Col>
          )}
        </Row>

        {/* Report Sections */}
        {report.sections.map((section, index) => (
          <div key={index} className="mb-4">
            <h6 className="border-bottom pb-2">{section.sectionTitle}</h6>
            <p className="text-muted">{section.description}</p>
            
            {section.data && section.data.length > 0 ? (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Value</th>
                    <th>Category</th>
                    {section.data[0].attributes && <th>Details</th>}
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td>{item.label}</td>
                      <td>{formatValue(item.value)}</td>
                      <td>
                        <Badge bg="secondary">{item.category}</Badge>
                      </td>
                      {item.attributes && (
                        <td>
                          <small className="text-muted">
                            {Object.entries(item.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </small>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3">
                <p className="text-muted">No data available for this section</p>
              </div>
            )}
          </div>
        ))}

        {/* Export Options */}
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Export Report</h6>
              <small className="text-muted">
                Download report in various formats
              </small>
            </div>
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onExport('JSON')}
              >
                JSON
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Report Metadata */}
        {report.metadata && Object.keys(report.metadata).length > 0 && (
          <div className="mt-3">
            <h6>Report Metadata</h6>
            <pre className="bg-light p-2 rounded">
              {JSON.stringify(report.metadata, null, 2)}
            </pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
