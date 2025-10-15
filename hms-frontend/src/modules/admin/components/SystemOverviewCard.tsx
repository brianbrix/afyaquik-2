import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { SystemOverview } from '../../../services/analyticsApi';

interface SystemOverviewCardProps {
  data: SystemOverview;
}

export function SystemOverviewCard({ data }: SystemOverviewCardProps) {
  const metrics = [
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      icon: 'bi-people',
      color: 'primary',
      subtitle: `${data.activeUsers} active`
    },
    {
      title: 'Total Patients',
      value: data.totalPatients.toLocaleString(),
      icon: 'bi-person-heart',
      color: 'success',
      subtitle: 'Registered patients'
    },
    {
      title: 'Queue Items',
      value: data.totalQueueItems.toLocaleString(),
      icon: 'bi-list-ul',
      color: 'info',
      subtitle: 'Current queue'
    },
    {
      title: 'Total Bills',
      value: data.totalBills.toLocaleString(),
      icon: 'bi-receipt',
      color: 'warning',
      subtitle: 'Generated bills'
    },
    {
      title: 'Total Revenue',
      value: `KES ${data.totalRevenue.toLocaleString()}`,
      icon: 'bi-currency-dollar',
      color: 'success',
      subtitle: 'System revenue'
    },
    {
      title: 'Prescriptions',
      value: data.totalPrescriptions.toLocaleString(),
      icon: 'bi-capsule',
      color: 'secondary',
      subtitle: 'Total prescriptions'
    },
    {
      title: 'Diagnostic Orders',
      value: data.totalDiagnosticOrders.toLocaleString(),
      icon: 'bi-clipboard-pulse',
      color: 'danger',
      subtitle: 'Lab orders'
    },
    {
      title: 'System Uptime',
      value: data.systemUptime,
      icon: 'bi-clock',
      color: 'success',
      subtitle: 'Availability'
    }
  ];

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          System Overview
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          {metrics.map((metric, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className={`text-${metric.color} mb-3`}>
                    <i className={`bi ${metric.icon} fs-1`}></i>
                  </div>
                  <h4 className="mb-1">{metric.value}</h4>
                  <h6 className="text-muted mb-2">{metric.title}</h6>
                  <small className="text-muted">{metric.subtitle}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        <Row className="mt-4">
          <Col xs={12} md={6}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="text-muted mb-2">System Load</h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 me-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${data.systemLoad > 0.8 ? 'danger' : data.systemLoad > 0.6 ? 'warning' : 'success'}`}
                        style={{ width: `${data.systemLoad * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Badge bg={data.systemLoad > 0.8 ? 'danger' : data.systemLoad > 0.6 ? 'warning' : 'success'}>
                    {(data.systemLoad * 100).toFixed(1)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="text-muted mb-2">System Status</h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span className="fw-medium">All Systems Operational</span>
                    </div>
                    <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
