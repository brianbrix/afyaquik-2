import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ReportRequest } from '../../../services/reportsApi';

interface ReportFiltersProps {
  reportType: string;
  filters: ReportRequest;
  onFiltersChange: (filters: Partial<ReportRequest>) => void;
}

export function ReportFilters({ reportType, filters, onFiltersChange }: ReportFiltersProps) {
  if (!reportType) {
    return null;
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ [field]: value || undefined });
  };

  const handleFormatChange = (format: string) => {
    onFiltersChange({ format });
  };

  const handleChartsChange = (includeCharts: boolean) => {
    onFiltersChange({ includeCharts });
  };

  return (
    <div>
      <Form.Label className="fw-bold">Report Filters</Form.Label>
      
      {/* Date Range */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Format Selection */}
      <Form.Group className="mb-3">
        <Form.Label>Export Format</Form.Label>
        <Form.Select
          value={filters.format || 'JSON'}
          onChange={(e) => handleFormatChange(e.target.value)}
        >
          <option value="JSON">JSON</option>
          <option value="PDF">PDF</option>
          <option value="EXCEL">Excel</option>
          <option value="CSV">CSV</option>
        </Form.Select>
      </Form.Group>

      {/* Additional Options */}
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Include Charts"
          checked={filters.includeCharts || false}
          onChange={(e) => handleChartsChange(e.target.checked)}
        />
      </Form.Group>

      {/* Report-specific filters */}
      {reportType === 'FINANCIAL' && (
        <div className="alert alert-warning">
          <small>
            <strong>Financial Report Filters:</strong><br />
            • Bill status (Paid, Pending, Cancelled)<br />
            • Amount range filters<br />
            • Department-wise breakdown
          </small>
        </div>
      )}

      {reportType === 'PATIENT' && (
        <div className="alert alert-info">
          <small>
            <strong>Patient Report Filters:</strong><br />
            • Patient status and demographics<br />
            • Visit history and medical records<br />
            • Department-wise patient distribution
          </small>
        </div>
      )}

      {reportType === 'OPERATIONAL' && (
        <div className="alert alert-success">
          <small>
            <strong>Operational Report Filters:</strong><br />
            • Queue performance metrics<br />
            • User activity and system usage<br />
            • Department performance analysis
          </small>
        </div>
      )}
    </div>
  );
}
