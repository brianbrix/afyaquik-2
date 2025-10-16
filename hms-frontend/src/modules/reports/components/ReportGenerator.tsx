import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { ReportRequest } from '../../../services/reportsApi';

interface ReportGeneratorProps {
  reportType: string;
  onGenerate: (request: ReportRequest) => void;
  isGenerating: boolean;
}

export function ReportGenerator({ reportType, onGenerate, isGenerating }: ReportGeneratorProps) {
  const [request, setRequest] = React.useState<ReportRequest>({
    reportType: reportType,
    format: 'JSON',
    includeCharts: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(request);
  };

  const handleInputChange = (field: keyof ReportRequest, value: any) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Generate Report</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={request.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value || undefined)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={request.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value || undefined)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Export Format</Form.Label>
            <Form.Select
              value={request.format}
              onChange={(e) => handleInputChange('format', e.target.value)}
            >
              <option value="JSON">JSON</option>
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Include Charts"
              checked={request.includeCharts || false}
              onChange={(e) => handleInputChange('includeCharts', e.target.checked)}
            />
          </Form.Group>

          <div className="d-grid">
            <Button
              type="submit"
              variant="primary"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
