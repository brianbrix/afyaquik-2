import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FinancialAnalytics } from '../../../services/analyticsApi';

interface FinancialAnalyticsCardProps {
  data: FinancialAnalytics;
}

export function FinancialAnalyticsCard({ data }: FinancialAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-currency-dollar me-2"></i>
          Financial Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">KES {data.totalRevenue.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">KES {data.revenueToday.toLocaleString()}</h3>
                <p className="text-muted mb-0">Revenue Today</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">KES {data.revenueThisWeek.toLocaleString()}</h3>
                <p className="text-muted mb-0">Revenue This Week</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">KES {data.revenueThisMonth.toLocaleString()}</h3>
                <p className="text-muted mb-0">Revenue This Month</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
