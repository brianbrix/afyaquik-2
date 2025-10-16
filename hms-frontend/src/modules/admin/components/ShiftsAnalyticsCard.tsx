import React from 'react';
import { Card, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { fetchStaffShifts } from '../../../services/schedulingApi';

interface ShiftsAnalyticsCardProps {
  data: any;
}

export function ShiftsAnalyticsCard({ data }: ShiftsAnalyticsCardProps) {
  // Fetch all shifts for analytics
  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts-analytics'],
    queryFn: () => fetchStaffShifts({}), // Fetch all shifts with no filters
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SCHEDULED': { variant: 'primary', text: 'Scheduled' },
      'IN_PROGRESS': { variant: 'warning', text: 'In Progress' },
      'COMPLETED': { variant: 'success', text: 'Completed' },
      'CANCELLED': { variant: 'danger', text: 'Cancelled' },
      'SWAP_REQUESTED': { variant: 'info', text: 'Swap Requested' },
      'SWAPPED': { variant: 'secondary', text: 'Swapped' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (shiftsLoading) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Shifts Analytics</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 mb-0">Loading shifts data...</p>
        </Card.Body>
      </Card>
    );
  }

  const shiftsData = shifts || [];
  
  // Calculate analytics
  const totalShifts = shiftsData.length;
  const completedShifts = shiftsData.filter(shift => shift.status === 'COMPLETED').length;
  const cancelledShifts = shiftsData.filter(shift => shift.status === 'CANCELLED').length;
  const swapRequestedShifts = shiftsData.filter(shift => shift.status === 'SWAP_REQUESTED').length;
  const completionRate = totalShifts > 0 ? ((completedShifts / totalShifts) * 100).toFixed(1) : 0;

  // Group by staff member
  const staffShifts = shiftsData.reduce((acc: any, shift: any) => {
    const staffName = shift.staffDisplayName || 'Unknown Staff';
    if (!acc[staffName]) {
      acc[staffName] = [];
    }
    acc[staffName].push(shift);
    return acc;
  }, {});

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Shifts Analytics</h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-4">
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-primary mb-1">{totalShifts}</h3>
              <p className="text-muted mb-0">Total Shifts</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-success mb-1">{completedShifts}</h3>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-danger mb-1">{cancelledShifts}</h3>
              <p className="text-muted mb-0">Cancelled</p>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h3 className="text-info mb-1">{completionRate}%</h3>
              <p className="text-muted mb-0">Completion Rate</p>
            </div>
          </Col>
        </Row>

        <div className="mb-4">
          <h6>Staff Performance</h6>
          <Table striped hover size="sm">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Total Shifts</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>No Show</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(staffShifts).map(([staffName, shifts]: [string, any]) => {
                const staffShiftsArray = shifts as any[];
                const completed = staffShiftsArray.filter(s => s.status === 'COMPLETED').length;
                const cancelled = staffShiftsArray.filter(s => s.status === 'CANCELLED').length;
                const swapRequested = staffShiftsArray.filter(s => s.status === 'SWAP_REQUESTED').length;
                const rate = staffShiftsArray.length > 0 ? ((completed / staffShiftsArray.length) * 100).toFixed(1) : '0';
                
                return (
                  <tr key={staffName}>
                    <td>{staffName}</td>
                    <td>{staffShiftsArray.length}</td>
                    <td className="text-success">{completed}</td>
                    <td className="text-danger">{cancelled}</td>
                    <td className="text-info">{swapRequested}</td>
                    <td>
                      <Badge bg={parseFloat(rate) >= 80 ? 'success' : parseFloat(rate) >= 60 ? 'warning' : 'danger'}>
                        {rate}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div>
          <h6>Recent Shifts</h6>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table striped hover size="sm">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Shift Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftsData.slice(0, 20).map((shift: any) => (
                  <tr key={shift.id}>
                    <td>{shift.staffDisplayName || 'Unknown'}</td>
                    <td>Shift #{shift.shiftType}</td>
                    <td>{formatDate(shift.startsAt.toString())}</td>
                    <td>{formatDate(shift.endsAt.toString())}</td>
                    <td>{formatDuration(shift.startsAt.toString(), shift.endsAt.toString())}</td>
                    <td>{getStatusBadge(shift.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
