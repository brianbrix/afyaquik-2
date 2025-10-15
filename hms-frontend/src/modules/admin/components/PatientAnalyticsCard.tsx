import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { PatientAnalytics } from '../../../services/analyticsApi';

interface PatientAnalyticsCardProps {
  data: PatientAnalytics;
}

export function PatientAnalyticsCard({ data }: PatientAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-person-heart me-2"></i>
          Patient Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">{data.totalPatients.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Patients</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{data.newPatientsToday}</h3>
                <p className="text-muted mb-0">New Today</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">{data.newPatientsThisWeek}</h3>
                <p className="text-muted mb-0">New This Week</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">{data.averageVisitsPerPatient.toFixed(1)}</h3>
                <p className="text-muted mb-0">Avg Visits/Patient</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
