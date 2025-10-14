import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { UserProfile } from '../../../services/profileApi';

interface ContactInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
}

export function ContactInfoSection({ profile, onUpdate, isUpdating }: ContactInfoSectionProps) {
  const [formData, setFormData] = useState({
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    alternatePhone: profile.alternatePhone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    postalCode: profile.postalCode || '',
    country: profile.country || ''
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
          <i className="bi bi-telephone me-2"></i>
          Contact Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alternate Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="United States"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="New York"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>State/Province</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="NY"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="10001"
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
                  Update Contact Information
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
