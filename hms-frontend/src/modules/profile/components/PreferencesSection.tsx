import React, { useState } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { UserProfile } from '../../../services/profileApi';

interface PreferencesSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
}

export function PreferencesSection({ profile, onUpdate, isUpdating }: PreferencesSectionProps) {
  const [formData, setFormData] = useState({
    preferredLanguage: profile.preferredLanguage || 'en',
    timezone: profile.timezone || 'UTC',
    emailNotifications: profile.emailNotifications ?? true,
    smsNotifications: profile.smsNotifications ?? false,
    pushNotifications: profile.pushNotifications ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-gear me-2"></i>
          Preferences & Settings
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Preferred Language</Form.Label>
                <Form.Select
                  value={formData.preferredLanguage}
                  onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Timezone</Form.Label>
                <Form.Select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <h6 className="mb-3">
            <i className="bi bi-bell me-2"></i>
            Notification Preferences
          </h6>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="emailNotifications"
                  label="Email Notifications"
                  checked={formData.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  help="Receive notifications via email"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="smsNotifications"
                  label="SMS Notifications"
                  checked={formData.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  help="Receive notifications via SMS (requires phone number)"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="pushNotifications"
                  label="Push Notifications"
                  checked={formData.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  help="Receive push notifications in your browser"
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
                  Update Preferences
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
