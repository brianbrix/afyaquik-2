import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { databaseRecordsApi, TableSchema, TableData, DatabaseStats } from '../../../services/databaseRecordsApi';
import { PageHeader } from '../../../components/shared/PageHeader';
import Swal from 'sweetalert2';

export function DatabaseRecordsPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  // Fetch all tables
  const { data: tables = [], isLoading: tablesLoading, error: tablesError } = useQuery({
    queryKey: ['database-tables'],
    queryFn: databaseRecordsApi.getAllTables
  });

  // Fetch all tenants for filtering
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => databaseRecordsApi.getAllTenants()
  });

  // Fetch database statistics
  const { data: dbStats } = useQuery({
    queryKey: ['database-stats'],
    queryFn: databaseRecordsApi.getDatabaseStats
  });

  // Fetch table schema
  const { data: tableSchema = [] } = useQuery({
    queryKey: ['table-schema', selectedTable],
    queryFn: () => databaseRecordsApi.getTableSchema(selectedTable!),
    enabled: !!selectedTable
  });

  // Fetch table data
  const { data: tableData, isLoading: dataLoading, error: dataError } = useQuery({
    queryKey: ['table-data', selectedTable, currentPage, pageSize, searchTerm, sortBy, sortDirection, selectedTenant],
    queryFn: () => databaseRecordsApi.getTableData(selectedTable!, currentPage, pageSize, searchTerm || undefined, sortBy || undefined, sortDirection, selectedTenant || undefined),
    enabled: !!selectedTable
  });

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setCurrentPage(0);
    setSearchTerm('');
    setSortBy('');
    setSortDirection('asc');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    if (selectedTable) {
      databaseRecordsApi.exportTableToCsv(selectedTable, searchTerm || undefined, sortBy || undefined, sortDirection)
        .then(() => {
          Swal.fire({ icon: 'success', title: 'CSV Export Started', timer: 1500, showConfirmButton: false });
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Export Failed', text: error.message });
        });
    }
  };

  const handleExportExcel = () => {
    if (selectedTable) {
      databaseRecordsApi.exportTableToExcel(selectedTable, searchTerm || undefined, sortBy || undefined, sortDirection)
        .then(() => {
          Swal.fire({ icon: 'success', title: 'Excel Export Started', timer: 1500, showConfirmButton: false });
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Export Failed', text: error.message });
        });
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (tablesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (tablesError) {
    return (
      <Alert variant="danger">
        Failed to load database tables. Please try again.
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Database Records" 
        subtitle="View and export database tables and records"
      />

      {/* Database Statistics */}
      {dbStats && (
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-primary">{dbStats.tableCount}</h4>
                <small>Total Tables</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-success">{dbStats.totalRows.toLocaleString()}</h4>
                <small>Total Records</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-info">
                  {Object.keys(dbStats.tableRowCounts).length}
                </h4>
                <small>Active Tables</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'tables')} className="mb-4">
        <Tab eventKey="tables" title="Database Tables">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Available Tables</h5>
              <Badge bg="info">{tables.length} tables</Badge>
            </Card.Header>
            <Card.Body>
              {tables.length === 0 ? (
                <Alert variant="info">No database tables found.</Alert>
              ) : (
                <div className="row">
                  {tables.map((table) => (
                    <div key={table} className="col-md-4 col-lg-3 mb-3">
                      <Card 
                        className={`h-100 ${selectedTable === table ? 'border-primary' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTableSelect(table)}
                      >
                        <Card.Body className="text-center">
                          <i className="bi bi-table fs-2 text-muted mb-2"></i>
                          <h6 className="mb-1">{table}</h6>
                          <small className="text-muted">
                            {dbStats?.tableRowCounts[table]?.toLocaleString() || '0'} records
                          </small>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="data" title="Table Data">
          {selectedTable ? (
            <div>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Table: {selectedTable}</h5>
                    <small className="text-muted">
                      {tableData?.totalElements?.toLocaleString() || '0'} total records
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={handleExportCsv}
                    >
                      <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                      Export CSV
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleExportExcel}
                    >
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Export Excel
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => setShowSchemaModal(true)}
                    >
                      <i className="bi bi-info-circle me-1"></i>
                      Schema
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {/* Search and Filters */}
                  <Row className="mb-3">
                    <Col md={4}>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Search records..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                          Clear
                        </Button>
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                      >
                        <option value="">All Tenants</option>
                        {tenants.map((tenant: any) => (
                          <option key={tenant.tenantCode} value={tenant.tenantCode}>
                            {tenant.tenantName} ({tenant.tenantCode})
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Select
                        value={pageSize}
                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                      >
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={200}>200 per page</option>
                        <option value={500}>500 per page</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={tableData?.last || false}
                        >
                          Next
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Data Table */}
                  {dataLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : dataError ? (
                    <Alert variant="danger">Failed to load table data.</Alert>
                  ) : tableData && tableData.content.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover striped>
                        <thead>
                          <tr>
                            {Object.keys(tableData.content[0]).map((column) => (
                              <th 
                                key={column}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort(column)}
                                className="user-select-none"
                              >
                                {column} {getSortIcon(column)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.content.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <span title={formatValue(value)}>
                                    {formatValue(value)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info">No data found for this table.</Alert>
                  )}

                  {/* Pagination Info */}
                  {tableData && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        Showing {tableData.numberOfElements} of {tableData.totalElements.toLocaleString()} records
                        (Page {tableData.number + 1} of {tableData.totalPages})
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          ) : (
            <Alert variant="info">
              Select a table from the Database Tables tab to view its data.
            </Alert>
          )}
        </Tab>
      </Tabs>

      {/* Schema Modal */}
      <Modal show={showSchemaModal} onHide={() => setShowSchemaModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Table Schema: {selectedTable}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tableSchema.length > 0 ? (
            <Table striped>
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Data Type</th>
                  <th>Nullable</th>
                  <th>Default</th>
                  <th>Max Length</th>
                </tr>
              </thead>
              <tbody>
                {tableSchema.map((column, index) => (
                  <tr key={index}>
                    <td><strong>{column.column_name}</strong></td>
                    <td>
                      <Badge bg="outline-primary">{column.data_type}</Badge>
                    </td>
                    <td>
                      <Badge bg={column.is_nullable === 'YES' ? 'outline-warning' : 'outline-success'}>
                        {column.is_nullable}
                      </Badge>
                    </td>
                    <td>{column.column_default || '-'}</td>
                    <td>{column.character_maximum_length || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No schema information available.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSchemaModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
