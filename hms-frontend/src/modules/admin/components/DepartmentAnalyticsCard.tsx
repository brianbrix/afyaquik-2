import React from 'react';
import { Card } from 'react-bootstrap';
import { DepartmentAnalytics } from '../../../services/analyticsApi';

interface DepartmentAnalyticsCardProps {
  data: DepartmentAnalytics;
}

export function DepartmentAnalyticsCard({ data }: DepartmentAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-building me-2"></i>
          Department Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted">Department analytics will be displayed here.</p>
      </Card.Body>
    </Card>
  );
}
