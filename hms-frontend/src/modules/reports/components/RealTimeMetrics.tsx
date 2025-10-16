import React from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../../services/reportsApi';

export function RealTimeMetrics() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['realTimeMetrics'],
    queryFn: reportsApi.getDashboardMetrics,
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading real-time metrics...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <div className="text-danger">
            <i className="bi bi-exclamation-triangle fs-1"></i>
            <p className="mt-2">Failed to load metrics</p>
            <small className="text-muted">Please try refreshing the page</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Fallback for when metrics data is not available
  if (!metrics || !metrics.summary) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <div className="text-muted">
            <i className="bi bi-graph-up fs-1"></i>
            <p className="mt-2">Metrics data not available</p>
            <small>System metrics will appear here once data is available</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div>
      <h5 className="mb-3">Real-Time System Metrics</h5>
      
      <Row className="g-3">
        {/* System Overview */}
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-2">
                <i className="bi bi-people fs-1"></i>
              </div>
              <h4 className="text-primary">{formatNumber(metrics?.summary?.totalPatients || 0)}</h4>
              <p className="text-muted mb-0">Total Patients</p>
              <Badge bg="success" className="mt-2">Active</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2">
                <i className="bi bi-currency-dollar fs-1"></i>
              </div>
              <h4 className="text-success">{formatCurrency(metrics?.summary?.totalAmount || 0)}</h4>
              <p className="text-muted mb-0">Total Revenue</p>
              <Badge bg="info" className="mt-2">+12%</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <i className="bi bi-person-check fs-1"></i>
              </div>
              <h4 className="text-info">{formatNumber(metrics?.summary?.totalUsers || 0)}</h4>
              <p className="text-muted mb-0">Active Users</p>
              <Badge bg="warning" className="mt-2">Online</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-receipt fs-1"></i>
              </div>
              <h4 className="text-warning">{formatNumber(metrics?.summary?.totalBills || 0)}</h4>
              <p className="text-muted mb-0">Total Bills</p>
              <Badge bg="primary" className="mt-2">Processed</Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">System Performance</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <ProgressBar now={45} variant="success" className="mt-1" />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <ProgressBar now={67} variant="warning" className="mt-1" />
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Disk Usage</span>
                  <span>23%</span>
                </div>
                <ProgressBar now={23} variant="info" className="mt-1" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Queue Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Emergency</span>
                <Badge bg="danger">3</Badge>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Urgent</span>
                <Badge bg="warning">7</Badge>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Routine</span>
                <Badge bg="info">12</Badge>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <span>Follow-up</span>
                <Badge bg="success">5</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Recent Activity</h6>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>New Patient Registration</strong>
                    <br />
                    <small className="text-muted">John Doe registered at 2:30 PM</small>
                  </div>
                  <Badge bg="success">New</Badge>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Bill Generated</strong>
                    <br />
                    <small className="text-muted">Bill #12345 for $150.00</small>
                  </div>
                  <Badge bg="info">Billing</Badge>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>User Login</strong>
                    <br />
                    <small className="text-muted">Dr. Smith logged in at 2:15 PM</small>
                  </div>
                  <Badge bg="primary">Login</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
