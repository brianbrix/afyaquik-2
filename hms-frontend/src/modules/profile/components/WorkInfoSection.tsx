import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { UserProfile } from '../../../services/authApi';

interface WorkInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  isUpdating?: boolean;
}

export function WorkInfoSection({ profile, onUpdate, isUpdating = false }: WorkInfoSectionProps) {
  // Safety check for undefined profile
  if (!profile) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Work Information</Card.Title>
          <div className="text-center py-4">
            <p className="text-muted">Loading profile information...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }
  const [department, setDepartment] = useState(profile?.department || '');
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || '');
  const [employeeId, setEmployeeId] = useState(profile?.employeeId || '');
  const [hireDate, setHireDate] = useState(profile?.hireDate || '');
  const [supervisor, setSupervisor] = useState(profile?.supervisor || '');
  const [workLocation, setWorkLocation] = useState(profile?.workLocation || '');
  const [workPhone, setWorkPhone] = useState(profile?.workPhone || '');
  const [workEmail, setWorkEmail] = useState(profile?.workEmail || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDepartment(profile.department || '');
    setJobTitle(profile.jobTitle || '');
    setEmployeeId(profile.employeeId || '');
    setHireDate(profile.hireDate || '');
    setSupervisor(profile.supervisor || '');
    setWorkLocation(profile.workLocation || '');
    setWorkPhone(profile.workPhone || '');
    setWorkEmail(profile.workEmail || '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate({
        department,
        jobTitle,
        employeeId,
        hireDate,
        supervisor,
        workLocation,
        workPhone,
        workEmail,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Work Information</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="department">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="jobTitle">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="employeeId">
                <Form.Label>Employee ID</Form.Label>
                <Form.Control
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="hireDate">
                <Form.Label>Hire Date</Form.Label>
                <Form.Control
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="supervisor" className="mb-3">
            <Form.Label>Supervisor</Form.Label>
            <Form.Control
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              disabled={!isEditing || isSaving}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="workLocation">
                <Form.Label>Work Location</Form.Label>
                <Form.Control
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="workPhone">
                <Form.Label>Work Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="workEmail" className="mb-3">
            <Form.Label>Work Email</Form.Label>
            <Form.Control
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              disabled={!isEditing || isSaving}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Work Info
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="me-2" disabled={isSaving}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}