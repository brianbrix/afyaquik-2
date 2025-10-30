import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Row, Col, Form, Alert, Spinner, Badge, InputGroup, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/shared/PageHeader';
import { ReactPaginateComponent } from '../../../components/shared/ReactPaginate';
import { DateRangePicker } from '../components/DateRangePicker';
import { searchPatients } from '../../../services/patientApi';
import { apiClient } from '../../../services/apiClient';

interface PatientVisit {
  id: number;
  patientId: number;
  patientName: string;
  patientNumber: string;
  visitDate: string;
  visitType: string;
  status: string;
  department: string;
  doctor: string;
  queueId?: number;
  queueStatus?: string;
  createdAt: string;
}

export function PatientVisitsPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [useDateRange, setUseDateRange] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => searchPatients('').then(pr => (pr && Array.isArray((pr as any).content)) ? (pr as any).content : [])
  });

  // Fetch queue items with server-side filters (status and optional date range)
  const { data: queueItems = [], isLoading: queueLoading } = useQuery({
    queryKey: ['queue-items', selectedStatus || 'PENDING_CHECKIN', useDateRange ? startDate : '', useDateRange ? endDate : ''],
    queryFn: () => {
      const params: Record<string, string> = {};
      params.status = (selectedStatus || 'PENDING_CHECKIN').trim();
      if (useDateRange && startDate && endDate) {
        params.startDate = startDate; // YYYY-MM-DD
        params.endDate = endDate;     // YYYY-MM-DD
      }
      return apiClient
        .get('/queue/items', { params })
        .then(res => {
          const data = res?.data?.data;
          if (!data) return [] as any[];
          if (Array.isArray(data)) return data;
          if (Array.isArray(data.content)) return data.content;
          return [] as any[];
        });
    }
  });

  // Combine patient and queue data to create visits
  const visits = useMemo(() => {
    const visitsList: PatientVisit[] = [];
    
    // Create visits from queue items
    (Array.isArray(queueItems) ? (queueItems as any[]) : []).forEach((queueItem: any) => {
      const patient = (Array.isArray(patients) ? (patients as any[]) : []).find((p: any) => p.id === queueItem.patientId);
      if (patient) {
        visitsList.push({
          id: queueItem.id,
          patientId: patient.id,
          patientName: patient.firstName + ' ' + patient.lastName,
          patientNumber: patient.medicalRecordNumber || patient.patientNumber || '',
          visitDate: queueItem.createdAt,
          visitType: 'Queue Visit',
          status: queueItem.status,
          department: queueItem.department || 'General',
          doctor: queueItem.assignedTo || 'Unassigned',
          queueId: queueItem.id,
          queueStatus: queueItem.status,
          createdAt: queueItem.createdAt
        });
      }
    });

    return visitsList.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [patients, queueItems]);

  // Filter visits based on date range and search
  const filteredVisits = useMemo(() => {
    let filtered = visits;

    // Apply date range filter (client-side safety in case backend filtering is bypassed)
    if (useDateRange && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Normalize end to end-of-day for inclusive comparison
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.visitDate);
        return visitDate >= start && visitDate <= end;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.patientName.toLowerCase().includes(search) ||
        visit.patientNumber.toLowerCase().includes(search) ||
        visit.visitType.toLowerCase().includes(search) ||
        visit.department.toLowerCase().includes(search) ||
        visit.doctor.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(visit => visit.status === selectedStatus);
    }

    return filtered;
  }, [visits, useDateRange, startDate, endDate, searchTerm, selectedStatus]);

  // Paginate results
  const totalPages = Math.ceil(filteredVisits.length / pageSize);
  const paginatedVisits = filteredVisits.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setUseDateRange(true);
    setCurrentPage(0);
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setUseDateRange(false);
    setCurrentPage(0);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'WAITING': 'warning',
      'IN_CONSULT': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'NO_SHOW': 'secondary'
    };
    return statusColors[status] || 'secondary';
  };

  const getUniqueStatuses = () => {
    return Array.from(new Set(visits.map(visit => visit.status)));
  };

  if (patientsLoading || queueLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading patient visits...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Patient Visits"
        subtitle="View and filter patient visits and queue entries"
      />

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">Patient Visits</h5>
              <small className="text-muted">
                Showing {filteredVisits.length} of {visits.length} visits
              </small>
            </Col>
            <Col md={6} className="text-end">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1"></i>
                Print Report
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date Range</Form.Label>
                <DateRangePicker
                  onDateRangeChange={handleDateRangeChange}
                  onClear={handleClearDateRange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {getUniqueStatuses().map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Per Page</Form.Label>
                <Form.Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Results */}
          {filteredVisits.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No patient visits found for the selected criteria.
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Visit Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Department</th>
                      <th>Doctor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td>
                          <div>
                            <strong>{visit.patientName}</strong>
                            <br />
                            <small className="text-muted">{visit.patientNumber}</small>
                          </div>
                        </td>
                        <td>
                          {new Date(visit.visitDate).toLocaleDateString()}
                          <br />
                          <small className="text-muted">
                            {new Date(visit.visitDate).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>{visit.visitType}</td>
                        <td>
                          <Badge bg={getStatusBadge(visit.status)}>
                            {visit.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>{visit.department}</td>
                        <td>{visit.doctor}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => { setSelectedVisit(visit); setShowVisitModal(true); }}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <Row className="align-items-center mt-3">
                <Col md={6}>
                  <div className="text-muted small">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredVisits.length)} of {filteredVisits.length} visits
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-end">
                    <ReactPaginateComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                    />
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Visit Details Modal */}
      <Modal show={showVisitModal} onHide={() => setShowVisitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Visit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVisit ? (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>Patient:</strong> {selectedVisit.patientName}
                <div className="text-muted small">{selectedVisit.patientNumber}</div>
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedVisit.visitDate).toLocaleString()}
              </div>
              <div>
                <strong>Type:</strong> {selectedVisit.visitType}
              </div>
              <div>
                <strong>Status:</strong> <Badge bg={getStatusBadge(selectedVisit.status)}>{selectedVisit.status.replace('_',' ')}</Badge>
              </div>
              <div>
                <strong>Department:</strong> {selectedVisit.department}
              </div>
              <div>
                <strong>Doctor:</strong> {selectedVisit.doctor}
              </div>
              {selectedVisit.queueId && (
                <div>
                  <strong>Queue ID:</strong> <code>{selectedVisit.queueId}</code>
                </div>
              )}
              <div className="text-muted small mt-2">
                Created: {new Date(selectedVisit.createdAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-muted">No visit selected</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVisitModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
