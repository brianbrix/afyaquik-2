import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { UserProfile } from '../../../services/profileApi';

interface WorkInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
}

export function WorkInfoSection({ profile, onUpdate, isUpdating }: WorkInfoSectionProps) {
  const [formData, setFormData] = useState({
    department: profile.department || '',
    jobTitle: profile.jobTitle || '',
    employeeId: profile.employeeId || '',
    hireDate: profile.hireDate || '',
    supervisor: profile.supervisor || '',
    workLocation: profile.workLocation || '',
    workPhone: profile.workPhone || '',
    workEmail: profile.workEmail || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-briefcase me-2"></i>
          Work Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="IT Department"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="Software Developer"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Employee ID</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  placeholder="EMP001"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hire Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Supervisor</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => handleChange('supervisor', e.target.value)}
                  placeholder="John Smith"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Work Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => handleChange('workLocation', e.target.value)}
                  placeholder="Main Office - Floor 3"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Work Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) => handleChange('workPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Work Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => handleChange('workEmail', e.target.value)}
                  placeholder="john.doe@company.com"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Update Work Information
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
