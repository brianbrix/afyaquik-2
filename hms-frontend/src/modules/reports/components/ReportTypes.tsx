import React from 'react';
import { Form } from 'react-bootstrap';

interface ReportTypesProps {
  reportTypes?: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function ReportTypes({ reportTypes, selectedType, onTypeChange }: ReportTypesProps) {
  // Default report types fallback
  const defaultReportTypes = [
    'PATIENT', 'FINANCIAL', 'OPERATIONAL', 'SYSTEM', 
    'BILLING', 'QUEUE', 'USER_ACTIVITY', 'DEPARTMENT'
  ];
  
  // Ensure reportTypes is always an array with fallback
  const safeReportTypes = Array.isArray(reportTypes) && reportTypes.length > 0 
    ? reportTypes 
    : defaultReportTypes;
  const reportTypeLabels: Record<string, string> = {
    'PATIENT': 'Patient Report',
    'FINANCIAL': 'Financial Report',
    'OPERATIONAL': 'Operational Report',
    'SYSTEM': 'System Report',
    'BILLING': 'Billing Report',
    'QUEUE': 'Queue Report',
    'USER_ACTIVITY': 'User Activity Report',
    'DEPARTMENT': 'Department Report'
  };

  const reportTypeDescriptions: Record<string, string> = {
    'PATIENT': 'Comprehensive patient information and visit history',
    'FINANCIAL': 'Revenue, billing, and financial performance metrics',
    'OPERATIONAL': 'System performance, queue management, and operational metrics',
    'SYSTEM': 'Complete system overview with all metrics',
    'BILLING': 'Detailed billing and payment information',
    'QUEUE': 'Queue performance and patient flow analysis',
    'USER_ACTIVITY': 'User login activity and system usage',
    'DEPARTMENT': 'Department-wise performance and statistics'
  };

  return (
    <div>
      <Form.Label className="fw-bold">Report Type</Form.Label>
      <Form.Select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="mb-3"
      >
        <option value="">Select a report type...</option>
        {safeReportTypes.map((type) => (
          <option key={type} value={type}>
            {reportTypeLabels[type] || type}
          </option>
        ))}
      </Form.Select>
      
      {selectedType && (
        <div className="alert alert-info">
          <small>
            <strong>{reportTypeLabels[selectedType]}:</strong><br />
            {reportTypeDescriptions[selectedType]}
          </small>
        </div>
      )}
    </div>
  );
}
