import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal, InputGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, AuditLog, AuditLogFilter } from '../../../services/auditLogApi';
import { superAdminApi } from '../../../services/superAdminApi';
import { useSuperAdminAuth } from '../../../app/providers/SuperAdminAuthProvider';
import { DateRangePicker } from '../components/DateRangePicker';
import { SearchableMultiSelect } from '../../../components/shared/SearchableMultiSelect';
import ReactPaginate from 'react-paginate';

export function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState<{startDate: string, endDate: string}>({startDate: '', endDate: ''});
  
  // Detect if we're in super admin context
  let isSuperAdmin = false;
  try {
    const { isAuthenticated } = useSuperAdminAuth();
    isSuperAdmin = isAuthenticated;
  } catch (error) {
    // Not in super admin context, use regular API
    isSuperAdmin = false;
  }

  // Fetch audit logs
  const { data: auditLogsData, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', currentPage, pageSize, searchTerm, filters, dateRange, isSuperAdmin],
    queryFn: () => {
      const filterParams = {
        ...filters,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        searchTerm: searchTerm || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: 'timestamp',
        sortDirection: 'desc'
      };
      
      return isSuperAdmin 
        ? superAdminApi.getAuditLogs(filterParams)
        : auditLogApi.getAuditLogs(filterParams);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch distinct values for filters
  const { data: distinctEntityTypes } = useQuery({
    queryKey: ['audit-logs-distinct-entity-types', isSuperAdmin],
    queryFn: isSuperAdmin ? superAdminApi.getDistinctEntityTypes : auditLogApi.getDistinctEntityTypes,
  });

  const { data: distinctStatuses } = useQuery({
    queryKey: ['audit-logs-distinct-statuses', isSuperAdmin],
    queryFn: isSuperAdmin ? superAdminApi.getDistinctStatuses : auditLogApi.getDistinctStatuses,
  });

  const { data: distinctHttpMethods } = useQuery({
    queryKey: ['audit-logs-distinct-http-methods', isSuperAdmin],
    queryFn: isSuperAdmin ? superAdminApi.getDistinctHttpMethods : auditLogApi.getDistinctHttpMethods,
  });

  const { data: distinctUsernames } = useQuery({
    queryKey: ['audit-logs-distinct-usernames', isSuperAdmin],
    queryFn: isSuperAdmin ? superAdminApi.getDistinctUsernames : auditLogApi.getDistinctUsernames,
  });

  const { data: distinctIpAddresses } = useQuery({
    queryKey: ['audit-logs-distinct-ip-addresses', isSuperAdmin],
    queryFn: isSuperAdmin ? superAdminApi.getDistinctIpAddresses : auditLogApi.getDistinctIpAddresses,
  });

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDateRange({startDate: '', endDate: ''});
    setCurrentPage(0);
  };

  const handleExportCsv = async () => {
    try {
      const exportParams = {
        ...filters,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        searchTerm: searchTerm || undefined
      };
      
      const blob = isSuperAdmin 
        ? await superAdminApi.getAuditLogs(exportParams) // Super admin doesn't have CSV export yet
        : await auditLogApi.exportAuditLogsToCsv(exportParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportJson = async () => {
    try {
      const exportParams = {
        ...filters,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        searchTerm: searchTerm || undefined
      };
      
      const blob = isSuperAdmin 
        ? await superAdminApi.getAuditLogs(exportParams) // Super admin doesn't have JSON export yet
        : await auditLogApi.exportAuditLogsToJson(exportParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'danger' : 'warning';
    return <Badge bg={variant}>{status}</Badge>;
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return '-';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="lg" />
        <p className="mt-3">Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Audit Logs</Alert.Heading>
        <p>Failed to load audit logs. Please try again.</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="audit-logs-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Audit Logs</h2>
          <p className="text-muted mb-0">
            System activity logs and audit trail
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel me-1"></i>
            Filters
          </Button>
          <Button 
            variant="outline-success" 
            onClick={handleExportCsv}
          >
            <i className="bi bi-download me-1"></i>
            Export CSV
          </Button>
          <Button 
            variant="outline-info" 
            onClick={handleExportJson}
          >
            <i className="bi bi-download me-1"></i>
            Export JSON
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => refetch()}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button variant="outline-secondary" type="button" onClick={handleSearch}>
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" type="button" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <div className="flex-grow-1"></div>
                <Form.Select
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </Form.Select>
              </div>
            </Col>
          </Row>

          {showFilters && (
            <>
              {/* Date Range Filter */}
              <Row className="mt-3 g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Date Range</Form.Label>
                    <DateRangePicker
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      onDateChange={(start, end) => {
                        setDateRange({startDate: start, endDate: end});
                        setCurrentPage(0);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Other Filters */}
              <Row className="mt-3 g-3">
                <Col md={3}>
                  <SearchableMultiSelect
                    label="Entity Types"
                    value={filters.entityTypes || []}
                    onChange={(values) => setFilters({ ...filters, entityTypes: values })}
                    options={distinctEntityTypes || []}
                    placeholder="Search entity types..."
                  />
                </Col>
                <Col md={3}>
                  <SearchableMultiSelect
                    label="Status"
                    value={filters.statuses || []}
                    onChange={(values) => setFilters({ ...filters, statuses: values })}
                    options={distinctStatuses || []}
                    placeholder="Search statuses..."
                  />
                </Col>
                <Col md={3}>
                  <SearchableMultiSelect
                    label="HTTP Methods"
                    value={filters.httpMethod ? [filters.httpMethod] : []}
                    onChange={(values) => setFilters({ ...filters, httpMethod: values[0] || undefined })}
                    options={distinctHttpMethods || []}
                    placeholder="Search HTTP methods..."
                  />
                </Col>
                <Col md={3}>
                  <SearchableMultiSelect
                    label="Users"
                    value={filters.usernames || []}
                    onChange={(values) => setFilters({ ...filters, usernames: values })}
                    options={distinctUsernames || []}
                    placeholder="Search users..."
                  />
                </Col>
              </Row>

              {/* Additional Filters Row */}
              <Row className="mt-3 g-3">
                <Col md={3}>
                  <SearchableMultiSelect
                    label="IP Addresses"
                    value={filters.ipAddress ? [filters.ipAddress] : []}
                    onChange={(values) => setFilters({ ...filters, ipAddress: values[0] || undefined })}
                    options={distinctIpAddresses || []}
                    placeholder="Search IP addresses..."
                  />
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Session ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter session ID"
                      value={filters.sessionId || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        sessionId: e.target.value || undefined
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Endpoint</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter endpoint"
                      value={filters.endpoint || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        endpoint: e.target.value || undefined
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Search Actions</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by action (e.g., CREATE_USER, UPDATE_PATIENT)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                    />
                    <Form.Text className="text-muted">
                      Use the search box above to filter by actions
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Audit Logs</h5>
            <small className="text-muted">
              {auditLogsData?.totalElements || 0} total logs
            </small>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity</th>
                <th>User</th>
                <th>Status</th>
                <th>Duration</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditLogsData?.content?.map((log) => (
                <tr key={log.id}>
                  <td>
                    <small>{new Date(log.timestamp).toLocaleString()}</small>
                  </td>
                  <td>
                    <code className="text-primary">{log.action}</code>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{log.entityType}</div>
                      {log.entityId && (
                        <small className="text-muted">ID: {log.entityId}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{log.username}</div>
                      <small className="text-muted">ID: {log.userId}</small>
                    </div>
                  </td>
                  <td>{getStatusBadge(log.status)}</td>
                  <td>{formatDuration(log.durationMs)}</td>
                  <td>
                    <small className="text-muted">{log.ipAddress || '-'}</small>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {auditLogsData && auditLogsData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ReactPaginate
            previousLabel="Previous"
            nextLabel="Next"
            pageCount={auditLogsData.totalPages}
            onPageChange={handlePageChange}
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            activeClassName="active"
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Audit Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div className="row g-3">
              <div className="col-md-6">
                <strong>ID:</strong> {selectedLog.id}
              </div>
              <div className="col-md-6">
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div className="col-md-6">
                <strong>Action:</strong> <code>{selectedLog.action}</code>
              </div>
              <div className="col-md-6">
                <strong>Status:</strong> {getStatusBadge(selectedLog.status)}
              </div>
              <div className="col-md-6">
                <strong>Entity Type:</strong> {selectedLog.entityType}
              </div>
              <div className="col-md-6">
                <strong>Entity ID:</strong> {selectedLog.entityId || '-'}
              </div>
              <div className="col-md-6">
                <strong>User:</strong> {selectedLog.username} (ID: {selectedLog.userId})
              </div>
              <div className="col-md-6">
                <strong>Duration:</strong> {formatDuration(selectedLog.durationMs)}
              </div>
              <div className="col-md-6">
                <strong>IP Address:</strong> {selectedLog.ipAddress || '-'}
              </div>
              <div className="col-md-6">
                <strong>Session ID:</strong> {selectedLog.sessionId || '-'}
              </div>
              <div className="col-md-6">
                <strong>Request ID:</strong> {selectedLog.requestId || '-'}
              </div>
              <div className="col-md-6">
                <strong>Endpoint:</strong> {selectedLog.endpoint || '-'}
              </div>
              <div className="col-md-6">
                <strong>HTTP Method:</strong> {selectedLog.httpMethod || '-'}
              </div>
              <div className="col-md-6">
                <strong>Response Status:</strong> {selectedLog.responseStatus || '-'}
              </div>
              {selectedLog.errorMessage && (
                <div className="col-12">
                  <strong>Error Message:</strong>
                  <div className="alert alert-danger mt-2">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}
              {selectedLog.oldValues && (
                <div className="col-12">
                  <strong>Old Values:</strong>
                  <pre className="bg-light p-2 mt-2" style={{ fontSize: '12px' }}>
                    {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValues && (
                <div className="col-12">
                  <strong>New Values:</strong>
                  <pre className="bg-light p-2 mt-2" style={{ fontSize: '12px' }}>
                    {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
