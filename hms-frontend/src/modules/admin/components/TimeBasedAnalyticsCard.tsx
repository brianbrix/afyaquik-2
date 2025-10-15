import React from 'react';
import { Card } from 'react-bootstrap';
import { TimeBasedAnalytics } from '../../../services/analyticsApi';

interface TimeBasedAnalyticsCardProps {
  data: TimeBasedAnalytics;
}

export function TimeBasedAnalyticsCard({ data }: TimeBasedAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-clock me-2"></i>
          Time-Based Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted">Time-based analytics will be displayed here.</p>
      </Card.Body>
    </Card>
  );
}
