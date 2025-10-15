import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { UserProfile } from '../../../services/authApi';

interface EmergencyContactSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  isUpdating?: boolean;
}

export function EmergencyContactSection({ profile, onUpdate, isUpdating = false }: EmergencyContactSectionProps) {
  // Safety check for undefined profile
  if (!profile) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Emergency Contact</Card.Title>
          <div className="text-center py-4">
            <p className="text-muted">Loading profile information...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone || '');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(profile.emergencyContactRelationship || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEmergencyContactName(profile.emergencyContactName || '');
    setEmergencyContactPhone(profile.emergencyContactPhone || '');
    setEmergencyContactRelationship(profile.emergencyContactRelationship || '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate({
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Emergency Contact</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="emergencyContactName" className="mb-3">
            <Form.Label>Emergency Contact Name</Form.Label>
            <Form.Control
              type="text"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              disabled={!isEditing || isSaving}
              placeholder="Full name of emergency contact"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="emergencyContactPhone">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                  placeholder="+254 700 000 000"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="emergencyContactRelationship">
                <Form.Label>Relationship</Form.Label>
                <Form.Select
                  value={emergencyContactRelationship}
                  onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                >
                  <option value="">Select relationship</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Emergency Contact
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