import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../../services/analyticsApi';
import { SystemOverviewCard } from '../components/SystemOverviewCard';
import { UserAnalyticsCard } from '../components/UserAnalyticsCard';
import { PatientAnalyticsCard } from '../components/PatientAnalyticsCard';
import { QueueAnalyticsCard } from '../components/QueueAnalyticsCard';
import { FinancialAnalyticsCard } from '../components/FinancialAnalyticsCard';
import { DepartmentAnalyticsCard } from '../components/DepartmentAnalyticsCard';
import { TimeBasedAnalyticsCard } from '../components/TimeBasedAnalyticsCard';
import { PerformanceMetricsCard } from '../components/PerformanceMetricsCard';
import { ShiftsAnalyticsCard } from '../components/ShiftsAnalyticsCard';
import { DateRangePicker } from '../components/DateRangePicker';

export function AnalyticsPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [useDateRange, setUseDateRange] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', useDateRange ? { startDate, endDate } : 'all'],
    queryFn: () => useDateRange 
      ? analyticsApi.getAnalyticsByDateRange(startDate, endDate)
      : analyticsApi.getSystemAnalytics(),
    enabled: !useDateRange || (!!startDate && !!endDate),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setUseDateRange(true);
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setUseDateRange(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Analytics</Alert.Heading>
        <p>Failed to load analytics data. Please try again.</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="analytics-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">System Analytics</h2>
          <p className="text-muted mb-0">
            {useDateRange 
              ? `Analytics for ${startDate} to ${endDate}`
              : 'Real-time system metrics and analytics'
            }
          </p>
        </div>
        <div className="d-flex gap-2">
          <DateRangePicker
            onDateRangeChange={handleDateRangeChange}
            onClear={handleClearDateRange}
            disabled={isLoading}
          />
          <Button 
            variant="outline-primary" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </div>
      </div>

      {analytics && typeof analytics === 'object' && (
        <Tabs defaultActiveKey="overview" className="mb-4">
          <Tab eventKey="overview" title="Overview">
            <Row className="g-4">
              <Col xs={12}>
                <SystemOverviewCard data={analytics.systemOverview || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="users" title="Users">
            <Row className="g-4">
              <Col xs={12}>
                <UserAnalyticsCard data={analytics.userAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="patients" title="Patients">
            <Row className="g-4">
              <Col xs={12}>
                <PatientAnalyticsCard data={analytics.patientAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="queue" title="Queue">
            <Row className="g-4">
              <Col xs={12}>
                <QueueAnalyticsCard data={analytics.queueAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="financial" title="Financial">
            <Row className="g-4">
              <Col xs={12}>
                <FinancialAnalyticsCard data={analytics.financialAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="departments" title="Departments">
            <Row className="g-4">
              <Col xs={12}>
                <DepartmentAnalyticsCard data={analytics.departmentAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="time-based" title="Time Analysis">
            <Row className="g-4">
              <Col xs={12}>
                <TimeBasedAnalyticsCard data={analytics.timeBasedAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="shifts" title="Shifts">
            <Row className="g-4">
              <Col xs={12}>
                <ShiftsAnalyticsCard data={analytics.shiftsAnalytics || {}} />
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="performance" title="Performance">
            <Row className="g-4">
              <Col xs={12}>
                <PerformanceMetricsCard data={analytics.performanceMetrics || {}} />
              </Col>
            </Row>
          </Tab>
        </Tabs>
      )}
    </div>
  );
}
