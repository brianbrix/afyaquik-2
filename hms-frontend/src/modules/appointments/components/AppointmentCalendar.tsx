import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, AppointmentDto, AppointmentStatus, appointmentUtils } from '../../../services/appointmentApi';
import { useAuth } from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

interface AppointmentCalendarProps {
  providerId?: number;
  departmentId?: number;
  onAppointmentClick?: (appointment: AppointmentDto) => void;
  onDateClick?: (date: Date) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  providerId,
  departmentId,
  onAppointmentClick,
  onDateClick
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // Get current month start and end dates
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  // Helper function to format date for backend (uses local time to match appointment storage)
  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Fetch appointments for the current visible range (request large page size to cover window)
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['appointments', 'calendar', providerId, departmentId, startDate.toISOString(), endDate.toISOString(), showTodayOnly],
    queryFn: () => appointmentApi.getAllPaged({
      providerId,
      departmentId,
      startDate: showTodayOnly ? formatDateForBackend(new Date()) : formatDateForBackend(startDate),
      endDate: showTodayOnly ? formatDateForBackend(new Date()) : formatDateForBackend(endDate),
      todayOnly: showTodayOnly
    }, 0, 1000)
  });
  const appointments: AppointmentDto[] = (pageData as any)?.content ?? [];

  // Mutation for updating appointment status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: string; reason?: string }) => {
      switch (action) {
        case 'confirm':
          return appointmentApi.confirm(id);
        case 'cancel':
          return appointmentApi.cancel(id, reason);
        case 'complete':
          return appointmentApi.complete(id);
        case 'no-show':
          return appointmentApi.markNoShow(id);
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
    }
  });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): AppointmentDto[] => {
    if (!appointments) return [];
    
    // Use local date to match how appointments are stored
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return appointments.filter((appointment: AppointmentDto) => 
      appointment.appointmentDateTime.startsWith(dateStr)
    );
  };

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
    onAppointmentClick?.(appointment);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  // Handle status update
  const handleStatusUpdate = async (action: string, reason?: string) => {
    if (!selectedAppointment) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedAppointment.id,
        action,
        reason
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Appointment ${action}ed successfully`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || `Failed to ${action} appointment`
      });
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const days = [];
    const current = new Date(startDate);

    // Header row
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = (
      <Row key="header" className="mb-2">
        {dayHeaders.map(day => (
          <Col key={day} className="text-center fw-bold text-muted">
            {day}
          </Col>
        ))}
      </Row>
    );

    // Calendar rows
    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(current);
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = selectedDate?.toDateString() === date.toDateString();
        const dayAppointments = getAppointmentsForDate(date);

        week.push(
          <Col key={date.toISOString()} className="calendar-day p-1">
            <div
              className={`calendar-date p-2 rounded ${
                isCurrentMonth ? 'text-dark' : 'text-muted'
              } ${isToday ? 'bg-primary text-white' : ''} ${
                isSelected ? 'bg-info text-white' : ''
              } ${!isCurrentMonth ? 'bg-light' : ''}`}
              style={{ cursor: 'pointer', minHeight: '100px' }}
              onClick={() => handleDateClick(date)}
            >
              <div className="fw-bold mb-1">{date.getDate()}</div>
              <div className="appointments-list">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className={`appointment-item mb-1 p-1 rounded small ${
                      appointmentUtils.getStatusColor(appointment.status) === 'primary' ? 'bg-primary text-white' :
                      appointmentUtils.getStatusColor(appointment.status) === 'success' ? 'bg-success text-white' :
                      appointmentUtils.getStatusColor(appointment.status) === 'warning' ? 'bg-warning text-dark' :
                      appointmentUtils.getStatusColor(appointment.status) === 'danger' ? 'bg-danger text-white' :
                      'bg-secondary text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppointmentClick(appointment);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="fw-bold">{appointmentUtils.formatTime(appointment.appointmentDateTime)}</div>
                    <div className="text-truncate">{appointment.patientName}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-muted small">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </Col>
        );
        current.setDate(current.getDate() + 1);
      }
      days.push(<Row key={current.toISOString()}>{week}</Row>);
    }

    return [headerRow, ...days];
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

  return (
    <div>
      {/* Calendar Header */}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h5>
          <div className="d-flex gap-2">
            <Button 
              variant={showTodayOnly ? "primary" : "outline-secondary"} 
              size="sm" 
              onClick={() => setShowTodayOnly(!showTodayOnly)}
            >
              <i className="bi bi-calendar-day me-1"></i>
              Today Only
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={goToPreviousMonth}>
              <i className="bi bi-chevron-left"></i>
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={goToNextMonth}>
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {renderCalendarGrid()}
        </Card.Body>
      </Card>

      {/* Selected Date Appointments */}
      {selectedDate && (
        <Card>
          <Card.Header>
            <h6 className="mb-0">
              Appointments for {selectedDate.toLocaleDateString()}
            </h6>
          </Card.Header>
          <Card.Body>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-muted text-center py-3">
                No appointments scheduled for this date
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {selectedDateAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="d-flex justify-content-between align-items-center p-2 border rounded"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div>
                      <div className="fw-bold">{appointment.patientName}</div>
                      <div className="text-muted small">
                        {appointmentUtils.formatTime(appointment.appointmentDateTime)} - 
                        {appointmentUtils.getEndTime(appointment)}
                      </div>
                      <div className="text-muted small">{appointment.reason}</div>
                    </div>
                    <Badge bg={appointmentUtils.getStatusColor(appointment.status)}>
                      {appointmentUtils.getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Appointment Details Modal */}
      <Modal show={showAppointmentModal} onHide={() => setShowAppointmentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Patient:</strong> {selectedAppointment.patientName}
                </Col>
                <Col md={6}>
                  <strong>Provider:</strong> {selectedAppointment.providerName}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date & Time:</strong> {appointmentUtils.formatDateTime(selectedAppointment.appointmentDateTime)}
                </Col>
                <Col md={6}>
                  <strong>Duration:</strong> {selectedAppointment.durationMinutes} minutes
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong> 
                  <Badge bg={appointmentUtils.getStatusColor(selectedAppointment.status)} className="ms-2">
                    {appointmentUtils.getStatusLabel(selectedAppointment.status)}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Type:</strong> {selectedAppointment.appointmentType || 'N/A'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Reason:</strong> {selectedAppointment.reason}
                </Col>
              </Row>
              {selectedAppointment.notes && (
                <Row className="mb-3">
                  <Col>
                    <strong>Notes:</strong> {selectedAppointment.notes}
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
            Close
          </Button>
          {selectedAppointment && (
            <>
              {selectedAppointment.status === AppointmentStatus.SCHEDULED && (
                <Button 
                  variant="success" 
                  onClick={() => handleStatusUpdate('confirm')}
                  disabled={updateStatusMutation.isPending}
                >
                  Confirm
                </Button>
              )}
              {appointmentUtils.canBeCancelled(selectedAppointment) && (
                <Button 
                  variant="danger" 
                  onClick={() => {
                    Swal.fire({
                      title: 'Cancel Appointment',
                      text: 'Are you sure you want to cancel this appointment?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, cancel it!',
                      cancelButtonText: 'No, keep it'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleStatusUpdate('cancel', 'Cancelled by user');
                      }
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              {selectedAppointment.status === AppointmentStatus.CONFIRMED && (
                <Button 
                  variant="warning" 
                  onClick={() => handleStatusUpdate('no-show')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark No Show
                </Button>
              )}
              {selectedAppointment.status === AppointmentStatus.IN_PROGRESS && (
                <Button 
                  variant="success" 
                  onClick={() => handleStatusUpdate('complete')}
                  disabled={updateStatusMutation.isPending}
                >
                  Complete
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};
