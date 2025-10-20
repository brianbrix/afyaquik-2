import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Badge, Row, Col, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, AppointmentDto, AppointmentStatus, AppointmentFilterRequest, appointmentUtils, type PageResponse } from '../../../services/appointmentApi';
import { AppointmentForm } from './AppointmentForm';
import { Pagination as Pager } from '../../../components/shared/Pagination';
import Swal from 'sweetalert2';

interface AppointmentListProps {
  providerId?: number;
  departmentId?: number;
  patientId?: number;
  showFilters?: boolean;
  showActions?: boolean;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  providerId,
  departmentId,
  patientId,
  showFilters = true,
  showActions = true
}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AppointmentFilterRequest>({
    providerId,
    departmentId,
    patientId,
    upcomingOnly: false,
    todayOnly: false
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch appointments
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['appointments', 'list', filters, currentPage, pageSize],
    queryFn: () => appointmentApi.getAllPaged(filters, currentPage, pageSize)
  });

  // Client-side pagination
  const paginatedAppointments = (pageData as PageResponse<AppointmentDto> | undefined)?.content ?? [];
  const totalPages = (pageData as PageResponse<AppointmentDto> | undefined)?.totalPages ?? 0;

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      appointmentApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment cancelled successfully',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => appointmentApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment confirmed successfully',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => appointmentApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment completed successfully',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => appointmentApi.markNoShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment marked as no-show',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment deleted successfully',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  // Handle filter changes
  const handleFilterChange = (field: keyof AppointmentFilterRequest, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(0);
  };

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, searchTerm }));
    setCurrentPage(0);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      providerId,
      departmentId,
      patientId,
      upcomingOnly: false,
      todayOnly: false
    });
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Handle appointment actions
  const handleEdit = (appointment: AppointmentDto) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleCancel = (appointment: AppointmentDto) => {
    Swal.fire({
      title: 'Cancel Appointment',
      text: 'Are you sure you want to cancel this appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      input: 'text',
      inputPlaceholder: 'Reason for cancellation (optional)',
      inputValidator: (value) => {
        // Optional validation
        return Promise.resolve();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        cancelMutation.mutate({
          id: appointment.id,
          reason: result.value || undefined
        });
      }
    });
  };

  const handleDelete = (appointment: AppointmentDto) => {
    Swal.fire({
      title: 'Delete Appointment',
      text: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(appointment.id);
      }
    });
  };

  const handleConfirm = (appointment: AppointmentDto) => {
    confirmMutation.mutate(appointment.id);
  };

  const handleComplete = (appointment: AppointmentDto) => {
    completeMutation.mutate(appointment.id);
  };

  const handleNoShow = (appointment: AppointmentDto) => {
    Swal.fire({
      title: 'Mark as No Show',
      text: 'Are you sure you want to mark this appointment as no-show?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark as no-show',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        noShowMutation.mutate(appointment.id);
      }
    });
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Failed to load appointments. Please try again.
      </Alert>
    );
  }

  // Use paginated appointments for display

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Filters</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" onClick={handleSearch}>
                      <i className="bi bi-search"></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  >
                    <option value="">All Statuses</option>
                    <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                    <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                    <option value={AppointmentStatus.ARRIVED}>Arrived</option>
                    <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                    <option value={AppointmentStatus.COMPLETED}>Completed</option>
                    <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                    <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                    <option value={AppointmentStatus.RESCHEDULED}>Rescheduled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Quick Filters</Form.Label>
                  <Form.Select
                    value={filters.upcomingOnly ? 'upcoming' : filters.todayOnly ? 'today' : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('upcomingOnly', value === 'upcoming');
                      handleFilterChange('todayOnly', value === 'today');
                    }}
                  >
                    <option value="">All Appointments</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="today">Today</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Page Size</Form.Label>
                  <Form.Select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="outline-secondary" onClick={handleClearFilters} className="me-2">
                  Clear Filters
                </Button>
                {showActions && (
                  <Button variant="primary" onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus"></i> New Appointment
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Appointments Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Appointments ({(pageData as PageResponse<AppointmentDto> | undefined)?.totalElements ?? 0})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {!paginatedAppointments || paginatedAppointments.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted">No appointments found</div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Reason</th>
                  {showActions && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <div className="fw-semibold">{appointment.patientName}</div>
                      <small className="text-muted">{appointment.patientMrn}</small>
                    </td>
                    <td>
                      <div>{appointment.providerName}</div>
                      <small className="text-muted">{appointment.departmentName}</small>
                    </td>
                    <td>
                      <div>{appointmentUtils.formatDate(appointment.appointmentDateTime)}</div>
                      <small className="text-muted">{appointmentUtils.formatTime(appointment.appointmentDateTime)}</small>
                    </td>
                    <td>{appointment.durationMinutes} min</td>
                    <td>
                      <Badge bg={appointmentUtils.getStatusColor(appointment.status)}>
                        {appointmentUtils.getStatusLabel(appointment.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {appointment.reason}
                      </div>
                    </td>
                    {showActions && (
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(appointment)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          
                          {appointment.status === AppointmentStatus.SCHEDULED && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleConfirm(appointment)}
                              disabled={confirmMutation.isPending}
                              title="Confirm"
                            >
                              <i className="bi bi-check"></i>
                            </Button>
                          )}
                          
                          {appointmentUtils.canBeCancelled(appointment) && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancel(appointment)}
                              disabled={cancelMutation.isPending}
                              title="Cancel"
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          )}
                          
                          {appointment.status === AppointmentStatus.CONFIRMED && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleNoShow(appointment)}
                              disabled={noShowMutation.isPending}
                              title="Mark No Show"
                            >
                              <i className="bi bi-person-x"></i>
                            </Button>
                          )}
                          
                          {appointment.status === AppointmentStatus.IN_PROGRESS && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleComplete(appointment)}
                              disabled={completeMutation.isPending}
                              title="Complete"
                            >
                              <i className="bi bi-check-circle"></i>
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(appointment)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <Card.Footer>
            <Row className="align-items-center">
              <Col md={12}>
                <div className="d-flex justify-content-end">
                  <Pager
                    page={currentPage}
                    size={pageSize}
                    totalElements={(pageData as PageResponse<AppointmentDto> | undefined)?.totalElements ?? 0}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(0); }}
                  />
                </div>
              </Col>
            </Row>
          </Card.Footer>
        )}
      </Card>

      {/* Appointment Form Modal */}
      <AppointmentForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingAppointment(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingAppointment ? {
          patientId: editingAppointment.patientId,
          providerId: editingAppointment.providerId,
          departmentId: editingAppointment.departmentId,
          appointmentDateTime: editingAppointment.appointmentDateTime,
          durationMinutes: editingAppointment.durationMinutes,
          status: editingAppointment.status,
          appointmentType: editingAppointment.appointmentType,
          reason: editingAppointment.reason,
          notes: editingAppointment.notes
        } : undefined}
        appointmentId={editingAppointment?.id}
      />
    </div>
  );
};
