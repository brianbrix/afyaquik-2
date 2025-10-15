import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Tab, Tabs, Spinner } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { PaginationControls } from '../../../components/shared/Pagination';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface TeamMember {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  roles: string[];
  departments: string[];
  enabled: boolean;
}

interface TimeOffRequest {
  id: number;
  userId: number;
  userDisplayName: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface ShiftSwapRequest {
  id: number;
  requesterId: number;
  requesterDisplayName: string;
  targetUserId: number;
  targetUserDisplayName: string;
  originalShiftId: number;
  targetShiftId: number;
  reason: string;
  status: string;
  createdAt: string;
}

export function TeamManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeOffPage, setTimeOffPage] = useState(0);
  const [swapPage, setSwapPage] = useState(0);
  const [pageSize] = useState(10);

  // Fetch team members (users where current user is supervisor)
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await apiClient.get(`/team/members`);
      return res.data.data as TeamMember[];
    }
  });

  // Fetch pending time-off requests
  const { data: timeOffData, isLoading: timeOffLoading, refetch: refetchTimeOff } = useQuery({
    queryKey: ['team-time-off', timeOffPage],
    queryFn: async () => {
      const res = await apiClient.get(`/team/time-off/requests/pending`);
      return res.data.data;
    }
  });

  // Fetch pending shift swap requests
  const { data: swapData, isLoading: swapLoading, refetch: refetchSwap } = useQuery({
    queryKey: ['team-shift-swaps', swapPage],
    queryFn: async () => {
      const res = await apiClient.get(`/team/shift-swaps/requests/pending`);
      return res.data.data;
    }
  });

  // Get pending counts
  const { data: pendingCounts } = useQuery({
    queryKey: ['team-pending-counts'],
    queryFn: async () => {
      const response = await apiClient.get('/team/pending-counts');
      return response.data.data;
    }
  });

  const handleTimeOffReview = async (requestId: number, status: 'APPROVED' | 'REJECTED') => {
    const { value: reviewNotes } = await Swal.fire({
      title: `${status === 'APPROVED' ? 'Approve' : 'Reject'} Time-Off Request`,
      input: 'textarea',
      inputLabel: 'Review Notes',
      inputPlaceholder: 'Enter your review notes...',
      inputValidator: (value) => {
        if (!value && status === 'REJECTED') {
          return 'Review notes are required when rejecting a request';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: status === 'APPROVED' ? 'Approve' : 'Reject',
      confirmButtonColor: status === 'APPROVED' ? '#28a745' : '#dc3545'
    });

    if (reviewNotes !== undefined) {
      try {
        await apiClient.post(`/team/time-off/requests/${requestId}/review?status=${status}&notes=${encodeURIComponent(reviewNotes || '')}`);
        Swal.fire('Success', `Time-off request ${status.toLowerCase()}`, 'success');
        refetchTimeOff();
      } catch (error: any) {
        Swal.fire('Error', `Failed to ${status.toLowerCase()} request: ${error.message}`, 'error');
      }
    }
  };

  const handleShiftSwapReview = async (requestId: number, status: 'APPROVED' | 'REJECTED') => {
    const { value: reviewNotes } = await Swal.fire({
      title: `${status === 'APPROVED' ? 'Approve' : 'Reject'} Shift Swap Request`,
      input: 'textarea',
      inputLabel: 'Review Notes',
      inputPlaceholder: 'Enter your review notes...',
      inputValidator: (value) => {
        if (!value && status === 'REJECTED') {
          return 'Review notes are required when rejecting a request';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: status === 'APPROVED' ? 'Approve' : 'Reject',
      confirmButtonColor: status === 'APPROVED' ? '#28a745' : '#dc3545'
    });

    if (reviewNotes !== undefined) {
      try {
        await apiClient.post(`/team/shift-swaps/requests/${requestId}/review?status=${status}&notes=${encodeURIComponent(reviewNotes || '')}`);
        Swal.fire('Success', `Shift swap request ${status.toLowerCase()}`, 'success');
        refetchSwap();
      } catch (error: any) {
        Swal.fire('Error', `Failed to ${status.toLowerCase()} request: ${error.message}`, 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'PENDING': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'CANCELLED': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Team Management"
        subtitle="Manage your team members, approve time-off requests, and handle shift swaps"
      />

      <Row>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{teamMembers?.length || 0}</h3>
              <p className="mb-0">Team Members</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{pendingCounts?.timeOff || 0}</h3>
              <p className="mb-0">Pending Time-Off</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{pendingCounts?.shiftSwaps || 0}</h3>
              <p className="mb-0">Pending Shift Swaps</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{(pendingCounts?.timeOff || 0) + (pendingCounts?.shiftSwaps || 0)}</h3>
              <p className="mb-0">Total Pending</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
            <Tab eventKey="overview" title="Team Overview">
              <div className="mt-3">
                <h5>Team Members</h5>
                {teamLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : teamMembers && teamMembers.length > 0 ? (
                  <div className="row g-3">
                    {teamMembers.map((member) => (
                      <Col md={6} lg={4} key={member.id}>
                        <Card className="h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">{member.displayName}</h6>
                              <Badge bg={member.enabled ? 'success' : 'danger'}>
                                {member.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-muted small mb-2">@{member.username}</p>
                            <div className="mb-2">
                              <strong>Roles:</strong>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {member.roles.map((role, idx) => (
                                  <Badge key={idx} bg="secondary" className="small">{role}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <strong>Departments:</strong>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {member.departments.map((dept, idx) => (
                                  <Badge key={idx} bg="info" className="small">{dept}</Badge>
                                ))}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">No team members found.</Alert>
                )}
              </div>
            </Tab>

            <Tab eventKey="time-off" title={`Time-Off Requests ${pendingCounts?.timeOff ? `(${pendingCounts.timeOff})` : ''}`}>
              <div className="mt-3">
                <h5>Pending Time-Off Requests</h5>
                {timeOffLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : timeOffData && Array.isArray(timeOffData) && timeOffData.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Type</th>
                            <th>Dates</th>
                            <th>Days</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeOffData.map((request: TimeOffRequest) => (
                            <tr key={request.id}>
                              <td>
                                <div>
                                  <strong>{request.userDisplayName}</strong>
                                  {request.emergencyContact && (
                                    <div className="small text-muted">
                                      Emergency: {request.emergencyContact}
                                      {request.emergencyPhone && ` (${request.emergencyPhone})`}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>{request.type}</td>
                              <td>
                                <div className="small">
                                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                </div>
                              </td>
                              <td>{request.totalDays}</td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '200px' }} title={request.reason}>
                                  {request.reason}
                                </div>
                              </td>
                              <td>{getStatusBadge(request.status)}</td>
                              <td>{formatDate(request.createdAt)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleTimeOffReview(request.id, 'APPROVED')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleTimeOffReview(request.id, 'REJECTED')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination removed since backend returns simple list */}
                  </>
                ) : (
                  <Alert variant="info">No pending time-off requests.</Alert>
                )}
              </div>
            </Tab>

            <Tab eventKey="shift-swaps" title={`Shift Swaps ${pendingCounts?.shiftSwaps ? `(${pendingCounts.shiftSwaps})` : ''}`}>
              <div className="mt-3">
                <h5>Pending Shift Swap Requests</h5>
                {swapLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : swapData && Array.isArray(swapData) && swapData.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Requester</th>
                            <th>Target User</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {swapData.map((request: ShiftSwapRequest) => (
                            <tr key={request.id}>
                              <td>{request.requesterDisplayName}</td>
                              <td>{request.targetUserDisplayName}</td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '200px' }} title={request.reason}>
                                  {request.reason}
                                </div>
                              </td>
                              <td>{getStatusBadge(request.status)}</td>
                              <td>{formatDate(request.createdAt)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleShiftSwapReview(request.id, 'APPROVED')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleShiftSwapReview(request.id, 'REJECTED')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination removed since backend returns simple list */}
                  </>
                ) : (
                  <Alert variant="info">No pending shift swap requests.</Alert>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}
