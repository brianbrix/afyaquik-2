import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { QueueAnalytics } from '../../../services/analyticsApi';

interface QueueAnalyticsCardProps {
  data: QueueAnalytics;
}

export function QueueAnalyticsCard({ data }: QueueAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-list-ul me-2"></i>
          Queue Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{data.totalQueueItems.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Queue Items</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">{data.pendingItems.toLocaleString()}</h3>
                <p className="text-muted mb-0">Pending Items</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">{data.completedItems.toLocaleString()}</h3>
                <p className="text-muted mb-0">Completed Items</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">{data.averageWaitTime.toFixed(1)}m</h3>
                <p className="text-muted mb-0">Avg Wait Time</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
