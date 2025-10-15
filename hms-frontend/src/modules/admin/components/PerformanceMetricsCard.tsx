import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { PerformanceMetrics } from '../../../services/analyticsApi';

interface PerformanceMetricsCardProps {
  data: PerformanceMetrics;
}

export function PerformanceMetricsCard({ data }: PerformanceMetricsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Performance Metrics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{data.averageResponseTime.toFixed(2)}ms</h3>
                <p className="text-muted mb-0">Avg Response Time</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">{data.systemAvailability.toFixed(1)}%</h3>
                <p className="text-muted mb-0">System Availability</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">{data.totalErrors.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Errors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-danger bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-danger mb-1">{data.errorsToday}</h3>
                <p className="text-muted mb-0">Errors Today</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
