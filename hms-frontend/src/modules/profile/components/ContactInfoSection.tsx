import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { UserProfile } from '../../../services/authApi';

interface ContactInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  isUpdating?: boolean;
}

export function ContactInfoSection({ profile, onUpdate, isUpdating = false }: ContactInfoSectionProps) {
  // Safety check for undefined profile
  if (!profile) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Contact Information</Card.Title>
          <div className="text-center py-4">
            <p className="text-muted">Loading profile information...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const [primaryPhone, setPrimaryPhone] = useState(profile?.primaryPhone || '');
  const [alternatePhone, setAlternatePhone] = useState(profile?.alternatePhone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [postalCode, setPostalCode] = useState(profile?.postalCode || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPrimaryPhone(profile?.primaryPhone || '');
    setAlternatePhone(profile?.alternatePhone || '');
    setEmail(profile?.email || '');
    setAddress(profile?.address || '');
    setCity(profile?.city || '');
    setState(profile?.state || '');
    setPostalCode(profile?.postalCode || '');
    setCountry(profile?.country || '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate({
        primaryPhone,
        alternatePhone,
        email,
        address,
        city,
        state,
        postalCode,
        country,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Contact Information</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="primaryPhone">
                <Form.Label>Primary Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="alternatePhone">
                <Form.Label>Alternate Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing || isSaving}
              required
            />
          </Form.Group>

          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing || isSaving}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="state">
                <Form.Label>State/Province</Form.Label>
                <Form.Control
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="postalCode">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  disabled={!isEditing || isSaving || isUpdating}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="country" className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={!isEditing || isSaving}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Contact Info
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