import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../../services/reportsApi';
import { ReportTypes } from '../components/ReportTypes';
import { ReportFilters } from '../components/ReportFilters';
import { ReportViewer } from '../components/ReportViewer';

export function ReportsDashboard() {
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [reportRequest, setReportRequest] = useState({
    reportType: '',
    format: 'JSON',
    includeCharts: true
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch dashboard metrics
  const { data: dashboardMetrics, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: reportsApi.getDashboardMetrics,
    refetchInterval: 30000
  });

  // Fetch report types
  const { data: reportTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: reportsApi.getReportTypes
  });

  const handleReportTypeChange = (reportType: string) => {
    setSelectedReportType(reportType);
    setReportRequest(prev => ({ ...prev, reportType }));
  };

  const handleFiltersChange = (filters: any) => {
    setReportRequest(prev => ({ ...prev, ...filters }));
  };

  const generateReport = async () => {
    if (!selectedReportType) return;

    setIsGenerating(true);
    try {
      // Ensure reportType is set in the request
      const requestWithType = { ...reportRequest, reportType: selectedReportType };
      
      // Debug: Log the request being sent
      console.log('Generating report with request:', requestWithType);
      
      let response;
      
      switch (selectedReportType) {
        case 'PATIENT':
          response = await reportsApi.generatePatientReport(requestWithType);
          break;
        case 'FINANCIAL':
          response = await reportsApi.generateFinancialReport(requestWithType);
          break;
        case 'OPERATIONAL':
          response = await reportsApi.generateOperationalReport(requestWithType);
          break;
        case 'SYSTEM':
          response = await reportsApi.generateSystemReport(requestWithType);
          break;
        case 'BILLING':
          response = await reportsApi.generateBillingReport(requestWithType);
          break;
        case 'QUEUE':
          response = await reportsApi.generateQueueReport(requestWithType);
          break;
        case 'USER_ACTIVITY':
          response = await reportsApi.generateUserActivityReport(requestWithType);
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      setGeneratedReport(response);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: string) => {
    if (!generatedReport) return;
    
    try {
      const exportRequest = { ...reportRequest, format };
      const response = await reportsApi.exportReport(exportRequest);
      
      if (response.downloadUrl) {
        const blob = await reportsApi.downloadReport(response.reportId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${response.reportId}.${format.toLowerCase()}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (dashboardLoading || typesLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading reports dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Reports & Analytics Dashboard</h2>
        </Col>
      </Row>

      {/* Quick Stats */}
      {dashboardMetrics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{dashboardMetrics.summary.totalPatients || 0}</h3>
                <p className="text-muted mb-0">Total Patients</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">${dashboardMetrics.summary.totalAmount || 0}</h3>
                <p className="text-muted mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{dashboardMetrics.summary.totalUsers || 0}</h3>
                <p className="text-muted mb-0">Active Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{dashboardMetrics.summary.totalBills || 0}</h3>
                <p className="text-muted mb-0">Total Bills</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* Report Generator */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Generate Report</h5>
            </Card.Header>
            <Card.Body>
              <ReportTypes
                reportTypes={reportTypes || []}
                selectedType={selectedReportType}
                onTypeChange={handleReportTypeChange}
              />
              
              <ReportFilters
                reportType={selectedReportType}
                filters={reportRequest}
                onFiltersChange={handleFiltersChange}
              />
              
              <div className="d-grid gap-2 mt-3">
                <Button
                  variant="primary"
                  onClick={generateReport}
                  disabled={!selectedReportType || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Report Viewer */}
        <Col lg={8}>
          {generatedReport ? (
            <ReportViewer
              report={generatedReport}
              onExport={exportReport}
            />
          ) : (
            <Card>
              <Card.Body className="text-center py-5">
                <h5 className="text-muted">No Report Generated</h5>
                <p className="text-muted">Select a report type and generate a report to view results.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
