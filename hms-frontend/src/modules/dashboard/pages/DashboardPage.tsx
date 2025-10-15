import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Button, Badge, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import { PageHeader } from "../../../components/shared/PageHeader";
import { dashboardApi, DashboardStats } from "../../../services/dashboardApi";
import { useAuth } from "../../../hooks/useAuth";
import { useRoleContext } from "../../../hooks/useRoleContext";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();
  const { activeRole } = useRoleContext();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch system dashboard data
  const { data: systemStats, isLoading: systemLoading, error: systemError } = useQuery({
    queryKey: ['dashboard-system'],
    queryFn: dashboardApi.getSystemDashboard,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user dashboard data
  const { data: userStats, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['dashboard-user'],
    queryFn: dashboardApi.getUserDashboard,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isLoading = systemLoading || userLoading;
  const error = systemError || userError;

  if (error) {
    return (
      <div className="d-flex flex-column gap-3">
        <PageHeader
          title="Dashboard"
          subtitle="Real-time analytics and user-specific insights"
        />
        <Alert variant="danger">
          Failed to load dashboard data. Please try again.
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'ACTIVE': 'success',
      'IN_PROGRESS': 'primary',
      'PENDING': 'warning',
      'NO_SHIFT': 'secondary',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getQuickActions = () => {
    const actions = [
      { title: "Queue Board", path: "/queue", icon: "bi-people", variant: "primary" },
      { title: "Patients", path: "/patients", icon: "bi-person-heart", variant: "info" },
      { title: "Scheduling", path: "/scheduling", icon: "bi-calendar", variant: "success" },
    ];

    if (userStats?.isSupervisor) {
      actions.push({ title: "Team Management", path: "/team", icon: "bi-people-fill", variant: "warning" });
    }

    if (userStats?.isAdmin) {
      actions.push({ title: "Admin Panel", path: "/admin", icon: "bi-gear", variant: "dark" });
    }

    if (userStats?.myPendingTimeOff && userStats.myPendingTimeOff > 0) {
      actions.push({ title: "Time Off", path: "/time-off", icon: "bi-clock", variant: "outline-primary" });
    }

    return actions;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'User'}`}
        subtitle={`Role: ${activeRole} • Real-time analytics and personalized insights`}
      />

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "overview")}
        className="mb-3"
      >
        <Tab eventKey="overview" title="Overview">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="bi bi-lightning me-2"></i>
                    Quick Actions
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {getQuickActions().map((action) => (
                      <Col key={action.title} lg={3} md={4} sm={6}>
                        <Button
                          as={Link}
                          to={action.path}
                          variant={action.variant}
                          className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                          style={{ minHeight: '100px' }}
                        >
                          <i className={`${action.icon} fs-2 mb-2`}></i>
                          <span className="fw-semibold">{action.title}</span>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* System Overview */}
              <Row className="g-3 mb-4">
                <Col lg={8}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">
                        <i className="bi bi-graph-up me-2"></i>
                        System Overview
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-primary">{systemStats?.totalPatients || 0}</div>
                            <div className="text-muted small">Total Patients</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-warning">{systemStats?.pendingCheckIn || 0}</div>
                            <div className="text-muted small">Pending Check-in</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-success">{systemStats?.closed || 0}</div>
                            <div className="text-muted small">Completed Today</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">
                        <i className="bi bi-activity me-2"></i>
                        Queue Status
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between">
                          <span>In Triage:</span>
                          <Badge bg="info">{systemStats?.inTriage || 0}</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>In Consult:</span>
                          <Badge bg="primary">{systemStats?.inConsult || 0}</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>In Diagnostics:</span>
                          <Badge bg="warning">{systemStats?.inDiagnostics || 0}</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>In Pharmacy:</span>
                          <Badge bg="success">{systemStats?.inPharmacy || 0}</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>In Billing:</span>
                          <Badge bg="secondary">{systemStats?.inBilling || 0}</Badge>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Blocked:</span>
                          <Badge bg="danger">{systemStats?.blocked || 0}</Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* User-Specific Information */}
              <Row className="g-3">
                <Col lg={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">
                        <i className="bi bi-person-circle me-2"></i>
                        My Workload
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-primary">{userStats?.myAssignedItems || 0}</div>
                            <div className="text-muted small">Assigned Items</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-warning">{userStats?.myPendingItems || 0}</div>
                            <div className="text-muted small">Pending</div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <div className="display-6 fw-bold text-success">{userStats?.myInProgressItems || 0}</div>
                            <div className="text-muted small">In Progress</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">
                        <i className="bi bi-clock me-2"></i>
                        My Status
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Shift Status:</span>
                          {getStatusBadge(userStats?.todayShiftStatus || 'NO_SHIFT')}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>On Shift:</span>
                          <Badge bg={userStats?.isOnShift ? 'success' : 'secondary'}>
                            {userStats?.isOnShift ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        {userStats?.myPendingTimeOff && userStats.myPendingTimeOff > 0 && (
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Pending Time Off:</span>
                            <Badge bg="warning">{userStats.myPendingTimeOff}</Badge>
                          </div>
                        )}
                        {userStats?.myApprovedTimeOff && userStats.myApprovedTimeOff > 0 && (
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Approved Time Off:</span>
                            <Badge bg="success">{userStats.myApprovedTimeOff}</Badge>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Supervisor/Admin Information */}
              {(userStats?.isSupervisor || userStats?.isAdmin) && (
                <Row className="g-3 mt-3">
                  {userStats.isSupervisor && (
                    <Col lg={6}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">
                            <i className="bi bi-people-fill me-2"></i>
                            Team Management
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between">
                              <span>Team Members:</span>
                              <Badge bg="info">{userStats.teamMembers || 0}</Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Pending Team Time Off:</span>
                              <Badge bg="warning">{userStats.pendingTeamTimeOff || 0}</Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                  {userStats.isAdmin && (
                    <Col lg={6}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">
                            <i className="bi bi-gear me-2"></i>
                            Admin Overview
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between">
                              <span>Total Users:</span>
                              <Badge bg="primary">{userStats.totalUsers || 0}</Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Active Users:</span>
                              <Badge bg="success">{userStats.activeUsers || 0}</Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="analytics" title="Analytics">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Detailed Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted">Financial Overview</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Bills:</span>
                        <strong>{systemStats?.totalBills || 0}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Pending Bills:</span>
                        <strong className="text-warning">{systemStats?.pendingBills || 0}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Paid Bills:</span>
                        <strong className="text-success">{systemStats?.paidBills || 0}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted">Diagnostics Overview</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Orders:</span>
                        <strong>{systemStats?.totalDiagnosticOrders || 0}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Pending Diagnostics:</span>
                        <strong className="text-warning">{systemStats?.pendingDiagnostics || 0}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
