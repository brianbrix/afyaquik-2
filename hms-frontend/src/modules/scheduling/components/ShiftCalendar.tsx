import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { fetchStaffShifts } from '../../../services/schedulingApi';
import { StaffShift } from '../../../types/scheduling';
import { useAuth } from '../../../hooks/useAuth';

interface ShiftCalendarProps {
  staffUserId?: number;
  departmentId?: number;
  roleId?: number;
  onShiftClick?: (shift: StaffShift) => void;
  onDateClick?: (date: Date) => void;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  staffUserId,
  departmentId,
  roleId,
  onShiftClick,
  onDateClick
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month start and end dates
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  // Helper function to format date for backend (uses local time to match shift storage)
  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Helper function to format date for range queries (start of day)
  const formatDateForRange = (date: Date, isEndDate: boolean = false): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (isEndDate) {
      // For end date, use end of day
      return `${year}-${month}-${day}T23:59:59`;
    } else {
      // For start date, use start of day
      return `${year}-${month}-${day}T00:00:00`;
    }
  };

  // Fetch shifts for the current visible range (request large page size to cover window)
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['shifts', 'calendar', staffUserId, departmentId, roleId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => fetchStaffShifts({
      staffUserId,
      departmentId,
      roleId,
      rangeStart: formatDateForRange(startDate, false),
      rangeEnd: formatDateForRange(endDate, true)
    }, 0, 1000)
  });
  const shifts: StaffShift[] = (pageData as any)?.content ?? [];

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date): StaffShift[] => {
    if (!shifts) return [];
    
    // Use local date to match how shifts are stored
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return shifts.filter((shift: StaffShift) => 
      shift.startsAt.startsWith(dateStr)
    );
  };

  // Get shifts for selected date
  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : [];

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

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  // Handle shift click
  const handleShiftClick = (shift: StaffShift) => {
    onShiftClick?.(shift);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'secondary';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'NO_SHOW': return 'warning';
      default: return 'secondary';
    }
  };

  // Format time
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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
        const dayShifts = getShiftsForDate(date);

        week.push(
          <Col 
            key={date.toISOString()} 
            className={`calendar-day ${!isCurrentMonth ? 'text-muted' : ''} ${isToday ? 'bg-light' : ''} ${isSelected ? 'bg-primary text-white' : ''}`}
            style={{ minHeight: '120px', cursor: 'pointer' }}
            onClick={() => handleDateClick(date)}
          >
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className={`fw-bold ${isToday ? 'text-primary' : ''}`}>
                {date.getDate()}
              </span>
              {dayShifts.length > 0 && (
                <Badge bg="info" className="small">
                  {dayShifts.length}
                </Badge>
              )}
            </div>
            <div className="shifts-container">
              {dayShifts.slice(0, 3).map((shift, index) => (
                <div 
                  key={shift.id}
                  className="shift-item mb-1 p-1 rounded small"
                  style={{ 
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f8f9fa',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShiftClick(shift);
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">{shift.shiftTypeName || 'Shift'}</span>
                    <Badge bg={getStatusBadgeVariant(shift.status)} className="small">
                      {shift.status}
                    </Badge>
                  </div>
                  <div className="text-muted">
                    {formatTime(shift.startsAt)} - {formatTime(shift.endsAt)}
                  </div>
                  {shift.checkedInAt && (
                    <div className="text-success small">
                      ✓ Checked in: {formatTime(shift.checkedInAt)}
                    </div>
                  )}
                  {shift.checkedOutAt && (
                    <div className="text-warning small">
                      ✓ Checked out: {formatTime(shift.checkedOutAt)}
                    </div>
                  )}
                </div>
              ))}
              {dayShifts.length > 3 && (
                <div className="text-muted small">
                  +{dayShifts.length - 3} more
                </div>
              )}
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
      <div className="text-center py-4">
        <Spinner animation="border" />
        <div className="mt-2">Loading shifts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Failed to load shifts. Please try again.
      </Alert>
    );
  }

  return (
    <div>
      {/* Calendar Header */}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Shifts
          </h5>
          <div className="d-flex gap-2">
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

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <Card.Header>
            <h6 className="mb-0">
              Shifts for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h6>
          </Card.Header>
          <Card.Body>
            {selectedDateShifts.length === 0 ? (
              <div className="text-muted">No shifts scheduled for this date.</div>
            ) : (
              <div className="shifts-list">
                {selectedDateShifts.map((shift) => (
                  <div key={shift.id} className="shift-detail mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{shift.shiftTypeName || 'Shift'}</h6>
                        <div className="text-muted small">
                          {formatTime(shift.startsAt)} - {formatTime(shift.endsAt)}
                        </div>
                      </div>
                      <Badge bg={getStatusBadgeVariant(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="small text-muted">Staff:</div>
                        <div>{shift.staffDisplayName || 'Unknown'}</div>
                      </div>
                      <div className="col-md-6">
                        <div className="small text-muted">Department:</div>
                        <div>{shift.departmentName || 'Unknown'}</div>
                      </div>
                    </div>

                    {shift.checkedInAt && (
                      <div className="mt-2">
                        <Badge bg="success" className="me-2">
                          Checked In: {formatTime(shift.checkedInAt)}
                        </Badge>
                      </div>
                    )}

                    {shift.checkedOutAt && (
                      <div className="mt-2">
                        <Badge bg="warning" className="me-2">
                          Checked Out: {formatTime(shift.checkedOutAt)}
                        </Badge>
                      </div>
                    )}

                    {shift.notes && (
                      <div className="mt-2">
                        <div className="small text-muted">Notes:</div>
                        <div className="small">{shift.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
