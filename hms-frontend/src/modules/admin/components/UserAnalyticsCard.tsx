import React from 'react';
import { Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { UserAnalytics } from '../../../services/analyticsApi';

interface UserAnalyticsCardProps {
  data: UserAnalytics;
}

export function UserAnalyticsCard({ data }: UserAnalyticsCardProps) {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-people me-2"></i>
          User Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-primary mb-1">{data.totalUsers.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-success mb-1">{data.activeUsers.toLocaleString()}</h3>
                <p className="text-muted mb-0">Active Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-warning mb-1">{data.newUsersToday}</h3>
                <p className="text-muted mb-0">New Today</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h3 className="text-info mb-1">{data.newUsersThisMonth}</h3>
                <p className="text-muted mb-0">New This Month</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <h6>Users by Role</h6>
            <Table size="sm">
              <tbody>
                {Object.entries(data.usersByRole).map(([role, count]) => (
                  <tr key={role}>
                    <td>{role}</td>
                    <td className="text-end">
                      <Badge bg="primary">{count}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h6>Recent User Activity</h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {data.recentUserActivity.map((activity, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <small className="fw-medium">{activity.username}</small>
                    <br />
                    <small className="text-muted">{activity.action}</small>
                  </div>
                  <small className="text-muted">{new Date(activity.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
