import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Row, Col, Form, Modal } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { PaginationControls } from '../../../components/shared/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { useAuth } from '../../../hooks/useAuth';
import { useSystemSettings } from '../../../hooks/useSystemSettings';
import Swal from 'sweetalert2';

interface TimeOffRequest {
  id: number;
  userId: number;
  userDisplayName: string;
  requestType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerDisplayName?: string;
  reviewNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface CreateTimeOffRequest {
  requestType: string;
  startDate: string;
  endDate: string;
  reason: string;
  userId: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const TIME_OFF_TYPES = [
  { value: 'VACATION', label: 'Vacation' },
  { value: 'SICK_LEAVE', label: 'Sick Leave' },
  { value: 'PERSONAL_LEAVE', label: 'Personal Leave' },
  { value: 'EMERGENCY_LEAVE', label: 'Emergency Leave' },
  { value: 'MATERNITY_LEAVE', label: 'Maternity Leave' },
  { value: 'PATERNITY_LEAVE', label: 'Paternity Leave' },
  { value: 'BEREAVEMENT_LEAVE', label: 'Bereavement Leave' },
  { value: 'STUDY_LEAVE', label: 'Study Leave' },
  { value: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
  { value: 'OTHER', label: 'Other' }
];

export function TimeOffRequestPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch user's time-off requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['time-off-requests', currentPage],
    queryFn: async () => {
      const res = await apiClient.get(`/time-off/requests/my?page=${currentPage}&size=${pageSize}`);
      return res.data.data;
    }
  });

  // Create time-off request mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateTimeOffRequest) => {
      const res = await apiClient.post('/time-off/requests', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      setShowCreateModal(false);
      Swal.fire('Success', 'Time-off request submitted successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to submit request: ${error.message}`, 'error');
    }
  });

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiClient.put(`/time-off/requests/${requestId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      Swal.fire('Success', 'Request cancelled successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to cancel request: ${error.message}`, 'error');
    }
  });

  const handleCancelRequest = async (requestId: number) => {
    const result = await Swal.fire({
      title: 'Cancel Request',
      text: 'Are you sure you want to cancel this time-off request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      cancelMutation.mutate(requestId);
    }
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

  const { formatDate } = useSystemSettings();

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Time-Off Requests"
        subtitle="Submit and manage your time-off requests"
      />

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">My Time-Off Requests</h5>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <i className="bi bi-plus-circle me-1"></i>
              New Request
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger">Failed to load time-off requests. Please try again.</Alert>
          )}

          {requestsData?.content && requestsData.content.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Reviewed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsData.content.map((request: TimeOffRequest) => (
                      <tr key={request.id}>
                        <td>
                          <Badge bg="info">{request.requestType.replace('_', ' ')}</Badge>
                        </td>
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
                        <td>{formatDate(request.submittedAt)}</td>
                        <td>
                          {request.reviewedAt ? (
                            <div className="small">
                              <div>{formatDate(request.reviewedAt)}</div>
                              {request.reviewerDisplayName && (
                                <div className="text-muted">by {request.reviewerDisplayName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {request.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                          {request.reviewNotes && (
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => {
                                Swal.fire({
                                  title: 'Review Notes',
                                  text: request.reviewNotes,
                                  icon: 'info'
                                });
                              }}
                            >
                              Notes
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={currentPage + 1}
                totalPages={requestsData.totalPages}
                totalItems={requestsData.totalElements}
                itemsPerPage={pageSize}
                onPageChange={(page) => setCurrentPage(page - 1)}
              />
            </>
          ) : (
            <Alert variant="info">No time-off requests found.</Alert>
          )}
        </Card.Body>
      </Card>

      {/* Create Request Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Form onSubmit={(e) => {
          e.preventDefault();
          if (!user?.id) {
            Swal.fire('Error', 'User not authenticated', 'error');
            return;
          }
          const formData = new FormData(e.currentTarget as HTMLFormElement);
          const data: CreateTimeOffRequest = {
            userId: user.id,
            requestType: formData.get('requestType') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            reason: formData.get('reason') as string,
            emergencyContact: formData.get('emergencyContact') as string || undefined,
            emergencyPhone: formData.get('emergencyPhone') as string || undefined
          };
          createMutation.mutate(data);
        }}>
          <Modal.Header closeButton>
            <Modal.Title>New Time-Off Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Request Type</Form.Label>
                  <Form.Select name="requestType" required>
                    <option value="">Select type...</option>
                    {TIME_OFF_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Days</Form.Label>
                  <Form.Control
                    type="text"
                    value={(() => {
                      const startDate = (document.querySelector('input[name="startDate"]') as HTMLInputElement)?.value;
                      const endDate = (document.querySelector('input[name="endDate"]') as HTMLInputElement)?.value;
                      if (startDate && endDate) {
                        return calculateDays(startDate, endDate).toString();
                      }
                      return '';
                    })()}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    required
                    onChange={() => {
                      // Trigger re-calculation of days
                      const event = new Event('input', { bubbles: true });
                      document.dispatchEvent(event);
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    required
                    onChange={() => {
                      // Trigger re-calculation of days
                      const event = new Event('input', { bubbles: true });
                      document.dispatchEvent(event);
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact"
                    placeholder="Name of emergency contact"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Emergency Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="emergencyPhone"
                    placeholder="Emergency contact phone"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="reason"
                    rows={3}
                    placeholder="Please provide a detailed reason for your time-off request..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
