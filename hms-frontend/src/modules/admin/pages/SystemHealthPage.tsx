import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { systemHealthApi, SystemHealthMetrics, SystemPerformanceMetrics, DatabaseStats } from '../../../services/systemHealthApi';
import { PageHeader } from '../../../components/shared/PageHeader';

export function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch system health metrics
  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: systemHealthApi.getSystemHealth,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch system performance metrics
  const { data: performance, isLoading: performanceLoading, error: performanceError } = useQuery({
    queryKey: ['systemPerformance'],
    queryFn: systemHealthApi.getSystemPerformance,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Fetch database statistics
  const { data: dbStats, isLoading: dbLoading, error: dbError } = useQuery({
    queryKey: ['databaseStats'],
    queryFn: systemHealthApi.getDatabaseStats,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'success';
      case 'WARNING': return 'warning';
      case 'CRITICAL': return 'danger';
      case 'DOWN': return 'dark';
      default: return 'secondary';
    }
  };

  const getMemoryUsageColor = (percent: number) => {
    if (percent < 70) return 'success';
    if (percent < 90) return 'warning';
    return 'danger';
  };

  if (healthLoading || performanceLoading || dbLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (healthError || performanceError || dbError) {
    return (
      <Alert variant="danger">
        Failed to load system health data. Please try again.
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader 
        title="System Health Dashboard" 
        subtitle="Monitor system performance and health metrics"
      />

      {/* Auto-refresh controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <Button
                  variant={autoRefresh ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="me-3"
                >
                  <i className={`bi bi-${autoRefresh ? 'pause' : 'play'}-circle me-1`}></i>
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </Button>
                <span className="text-muted">
                  Refresh every {refreshInterval / 1000}s
                </span>
              </div>
            </Col>
            <Col md={6} className="text-end">
              <small className="text-muted">
                Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Never'}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* System Status */}
      {health && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-heart-pulse me-2"></i>
              System Status
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <Badge bg={getStatusColor(health.status)} className="fs-6 mb-2">
                    {health.status}
                  </Badge>
                  <div className="text-muted">Overall Status</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-primary">{formatUptime(health.uptime)}</h4>
                  <div className="text-muted">Uptime</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-info">{health.availableProcessors}</h4>
                  <div className="text-muted">CPU Cores</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-success">{health.activeTenants}</h4>
                  <div className="text-muted">Active Tenants</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Memory Usage */}
      {health && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-memory me-2"></i>
              Memory Usage
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Heap Memory</span>
                    <span>{health.memoryUsagePercent.toFixed(1)}%</span>
                  </div>
                  <ProgressBar 
                    variant={getMemoryUsageColor(health.memoryUsagePercent)}
                    now={health.memoryUsagePercent}
                    style={{ height: '20px' }}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Used: {formatBytes(health.usedMemory)}
                    </small>
                    <small className="text-muted">
                      Total: {formatBytes(health.totalMemory)}
                    </small>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="row">
                  <div className="col-6">
                    <div className="text-center">
                      <h5 className="text-primary">{formatBytes(health.usedMemory)}</h5>
                      <small className="text-muted">Used Memory</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h5 className="text-success">{formatBytes(health.freeMemory)}</h5>
                      <small className="text-muted">Free Memory</small>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Performance Metrics */}
      {performance && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-speedometer2 me-2"></i>
              Performance Metrics
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-info">{performance.threadCount}</h4>
                  <div className="text-muted">Active Threads</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-warning">{performance.peakThreadCount}</h4>
                  <div className="text-muted">Peak Threads</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-primary">{performance.gcCount}</h4>
                  <div className="text-muted">GC Collections</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="text-success">{formatBytes(performance.gcTime)}</h4>
                  <div className="text-muted">GC Time</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Database Statistics */}
      {dbStats && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-database me-2"></i>
              Database Statistics
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-primary">{dbStats.totalTenants}</h4>
                  <div className="text-muted">Total Tenants</div>
                </div>
              </Col>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-success">{dbStats.activeTenants}</h4>
                  <div className="text-muted">Active Tenants</div>
                </div>
              </Col>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-info">{dbStats.totalUsers}</h4>
                  <div className="text-muted">Total Users</div>
                </div>
              </Col>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-warning">{dbStats.activeUsers}</h4>
                  <div className="text-muted">Active Users</div>
                </div>
              </Col>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-danger">{dbStats.superAdmins}</h4>
                  <div className="text-muted">Super Admins</div>
                </div>
              </Col>
              <Col md={2}>
                <div className="text-center">
                  <h4 className="text-secondary">
                    {dbStats.totalUsers > 0 ? 
                      ((dbStats.activeUsers / dbStats.totalUsers) * 100).toFixed(1) : 
                      '0'
                    }%
                  </h4>
                  <div className="text-muted">User Activity</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Memory Breakdown */}
      {performance && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-pie-chart me-2"></i>
              Memory Breakdown
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Heap Memory</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Used</span>
                  <span>{formatBytes(performance.heapUsed)}</span>
                </div>
                <ProgressBar 
                  variant="info"
                  now={(performance.heapUsed / performance.heapMax) * 100}
                  style={{ height: '15px' }}
                />
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">Max: {formatBytes(performance.heapMax)}</small>
                </div>
              </Col>
              <Col md={6}>
                <h6>Non-Heap Memory</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Used</span>
                  <span>{formatBytes(performance.nonHeapUsed)}</span>
                </div>
                <ProgressBar 
                  variant="warning"
                  now={performance.nonHeapMax > 0 ? (performance.nonHeapUsed / performance.nonHeapMax) * 100 : 0}
                  style={{ height: '15px' }}
                />
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">Max: {formatBytes(performance.nonHeapMax)}</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
