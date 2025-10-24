/**
 * Offline Audit Trail Component
 * Displays and manages offline audit logs
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert, Form, Row, Col, Modal } from 'react-bootstrap';
import { offlineAuditService, OfflineAuditEntry, AuditSyncStatus } from '../../services/offlineAuditService';

export const OfflineAuditTrail: React.FC = () => {
  const [auditEntries, setAuditEntries] = useState<OfflineAuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<OfflineAuditEntry[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<AuditSyncStatus | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    success: '',
    offline: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = () => {
    const entries = offlineAuditService.getAllEntries();
    setAuditEntries(entries);
    setFilteredEntries(entries);
    setStatistics(offlineAuditService.getStatistics());
  };

  const applyFilters = () => {
    let filtered = [...auditEntries];

    if (filters.action) {
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.userId) {
      filtered = filtered.filter(entry => 
        entry.userId.toString().includes(filters.userId)
      );
    }

    if (filters.success) {
      const successFilter = filters.success === 'true';
      filtered = filtered.filter(entry => entry.success === successFilter);
    }

    if (filters.offline) {
      const offlineFilter = filters.offline === 'true';
      filtered = filtered.filter(entry => entry.offline === offlineFilter);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= toDate);
    }

    setFilteredEntries(filtered);
  };

  const handleSyncToServer = async () => {
    try {
      const status = await offlineAuditService.syncToServer();
      setSyncStatus(status);
      loadAuditData(); // Refresh data after sync
    } catch (error) {
      console.error('Failed to sync audit trail:', error);
    }
  };

  const handleExport = () => {
    const data = offlineAuditService.exportEntries(exportFormat);
    const blob = new Blob([data], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offline-audit-trail.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleClearOldEntries = () => {
    if (window.confirm('Clear audit entries older than 30 days?')) {
      offlineAuditService.clearOldEntries(30);
      loadAuditData();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'primary';
    if (action.includes('CREATE') || action.includes('UPDATE')) return 'success';
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('VIEW') || action.includes('ACCESS')) return 'info';
    if (action.includes('PERMISSION')) return 'warning';
    if (action.includes('SECURITY')) return 'dark';
    return 'secondary';
  };

  return (
    <div className="p-3">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Offline Audit Trail</h5>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm" onClick={handleSyncToServer}>
                Sync to Server
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => setShowExportModal(true)}>
                Export
              </Button>
              <Button variant="outline-warning" size="sm" onClick={handleClearOldEntries}>
                Clear Old
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={loadAuditData}>
                Refresh
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Statistics */}
          {statistics && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4>{statistics.totalEntries}</h4>
                    <small>Total Entries</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4>{statistics.offlineEntries}</h4>
                    <small>Offline Entries</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4>{statistics.successRate.toFixed(1)}%</h4>
                    <small>Success Rate</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4>{statistics.errorRate.toFixed(1)}%</h4>
                    <small>Error Rate</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Sync Status */}
          {syncStatus && (
            <Alert variant={syncStatus.failedEntries > 0 ? 'warning' : 'success'} className="mb-3">
              <Alert.Heading>Sync Status</Alert.Heading>
              <p>
                <strong>Total:</strong> {syncStatus.totalEntries} | 
                <strong> Synced:</strong> {syncStatus.syncedEntries} | 
                <strong> Failed:</strong> {syncStatus.failedEntries}
              </p>
              {syncStatus.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul className="mb-0">
                    {syncStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {/* Filters */}
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Filters</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Action</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filter by action"
                      value={filters.action}
                      onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>User ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filter by user"
                      value={filters.userId}
                      onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Success</Form.Label>
                    <Form.Select
                      value={filters.success}
                      onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                    >
                      <option value="">All</option>
                      <option value="true">Success</option>
                      <option value="false">Failed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Offline</Form.Label>
                    <Form.Select
                      value={filters.offline}
                      onChange={(e) => setFilters({ ...filters, offline: e.target.value })}
                    >
                      <option value="">All</option>
                      <option value="true">Offline</option>
                      <option value="false">Online</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-2">
                <Button variant="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" className="ms-2" onClick={() => {
                  setFilters({
                    action: '', userId: '', success: '', offline: '', dateFrom: '', dateTo: ''
                  });
                  setFilteredEntries(auditEntries);
                }}>
                  Clear Filters
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Audit Entries Table */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Offline</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(-100).reverse().map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatTimestamp(entry.timestamp)}</td>
                    <td>
                      <div>
                        <strong>{entry.username}</strong>
                        <br />
                        <small className="text-muted">ID: {entry.userId}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getActionBadgeVariant(entry.action)}>
                        {entry.action}
                      </Badge>
                    </td>
                    <td>
                      {entry.resourceType && (
                        <div>
                          <strong>{entry.resourceType}</strong>
                          {entry.resourceId && <span> #{entry.resourceId}</span>}
                          {entry.resourceName && (
                            <div><small>{entry.resourceName}</small></div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg={entry.success ? 'success' : 'danger'}>
                        {entry.success ? 'Success' : 'Failed'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={entry.offline ? 'warning' : 'info'}>
                        {entry.offline ? 'Offline' : 'Online'}
                      </Badge>
                    </td>
                    <td>
                      {entry.errorMessage && (
                        <small className="text-danger">{entry.errorMessage}</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <Alert variant="info" className="text-center">
              No audit entries found matching the current filters.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Audit Trail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Export Format</Form.Label>
            <Form.Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </Form.Select>
          </Form.Group>
          <p className="text-muted">
            This will export all {filteredEntries.length} filtered audit entries.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Export
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
