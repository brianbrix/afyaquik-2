import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { UserProfile } from '../../../services/profileApi';

interface EmergencyContactSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
}

export function EmergencyContactSection({ profile, onUpdate, isUpdating }: EmergencyContactSectionProps) {
  const [formData, setFormData] = useState({
    emergencyContactName: profile.emergencyContactName || '',
    emergencyContactPhone: profile.emergencyContactPhone || '',
    emergencyContactRelationship: profile.emergencyContactRelationship || ''
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
          <i className="bi bi-person-heart me-2"></i>
          Emergency Contact
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  placeholder="Jane Smith"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Relationship</Form.Label>
                <Form.Select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Important:</strong> Please ensure your emergency contact information is up-to-date. 
            This information will be used in case of emergencies.
          </div>

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
                  Update Emergency Contact
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
