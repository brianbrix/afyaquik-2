import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal, InputGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, AuditLog, AuditLogFilter } from '../../../services/auditLogApi';
import { DateRangePicker } from '../components/DateRangePicker';
import ReactPaginate from 'react-paginate';

export function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch audit logs
  const { data: auditLogsData, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', currentPage, pageSize, searchTerm, filters],
    queryFn: () => auditLogApi.getAuditLogs({
      ...filters,
      searchTerm: searchTerm || undefined,
      page: currentPage,
      size: pageSize,
      sortBy: 'timestamp',
      sortDirection: 'desc'
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch distinct values for filters
  const { data: distinctActions } = useQuery({
    queryKey: ['audit-logs-distinct-actions'],
    queryFn: auditLogApi.getDistinctActions,
  });

  const { data: distinctEntityTypes } = useQuery({
    queryKey: ['audit-logs-distinct-entity-types'],
    queryFn: auditLogApi.getDistinctEntityTypes,
  });

  const { data: distinctStatuses } = useQuery({
    queryKey: ['audit-logs-distinct-statuses'],
    queryFn: auditLogApi.getDistinctStatuses,
  });

  const { data: distinctHttpMethods } = useQuery({
    queryKey: ['audit-logs-distinct-http-methods'],
    queryFn: auditLogApi.getDistinctHttpMethods,
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
    setCurrentPage(0);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await auditLogApi.exportAuditLogsToCsv({
        ...filters,
        searchTerm: searchTerm || undefined
      });
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
      const blob = await auditLogApi.exportAuditLogsToJson({
        ...filters,
        searchTerm: searchTerm || undefined
      });
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={handleClearFilters}>
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
            <Row className="mt-3 g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Actions</Form.Label>
                  <Form.Select
                    multiple
                    value={filters.actions || []}
                    onChange={(e) => setFilters({
                      ...filters,
                      actions: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                  >
                    {distinctActions?.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Entity Types</Form.Label>
                  <Form.Select
                    multiple
                    value={filters.entityTypes || []}
                    onChange={(e) => setFilters({
                      ...filters,
                      entityTypes: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                  >
                    {distinctEntityTypes?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    multiple
                    value={filters.statuses || []}
                    onChange={(e) => setFilters({
                      ...filters,
                      statuses: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                  >
                    {distinctStatuses?.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>HTTP Method</Form.Label>
                  <Form.Select
                    multiple
                    value={filters.httpMethod ? [filters.httpMethod] : []}
                    onChange={(e) => setFilters({
                      ...filters,
                      httpMethod: e.target.value || undefined
                    })}
                  >
                    <option value="">All Methods</option>
                    {distinctHttpMethods?.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
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
