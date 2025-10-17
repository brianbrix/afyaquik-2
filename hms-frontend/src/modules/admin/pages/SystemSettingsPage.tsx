import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { systemSettingsApi, SystemSetting, UpdateSystemSettingRequest } from '../../../services/systemSettingsApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timezones, setTimezones] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Load settings
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsApi.getAllSettings,
    retry: 3
  });

  // Load timezones
  const { data: timezonesData, isLoading: timezonesLoading } = useQuery({
    queryKey: ['available-timezones'],
    queryFn: systemSettingsApi.getAvailableTimezones,
    retry: 3
  });

  // Initialize default settings mutation
  const initializeDefaultsMutation = useMutation({
    mutationFn: systemSettingsApi.initializeDefaultSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setSuccess('Default settings initialized successfully');
    },
    onError: (error: any) => {
      setError('Failed to initialize default settings: ' + error.message);
    }
  });

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
      setLoading(false);
    }
    if (timezonesData) {
      setTimezones(timezonesData);
    }
  }, [settingsData, timezonesData]);

  const handleSettingChange = (settingKey: string, newValue: string) => {
    setSettings(prev => prev.map(setting => 
      setting.settingKey === settingKey 
        ? { ...setting, settingValue: newValue }
        : setting
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatePromises = settings
        .filter(setting => setting.isEditable && setting.settingValue !== setting.effectiveValue)
        .map(setting => 
          systemSettingsApi.updateSetting(setting.settingKey, {
            settingKey: setting.settingKey,
            settingValue: setting.settingValue || ''
          })
        );

      await Promise.all(updatePromises);
      setSuccess('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    } catch (err: any) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    const result = await Swal.fire({
      title: 'Initialize Default Settings?',
      text: 'This will create default system settings if they don\'t exist. Existing settings will not be changed.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, initialize',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      initializeDefaultsMutation.mutate();
    }
  };

  const getSettingTypeComponent = (setting: SystemSetting) => {
    switch (setting.settingType) {
      case 'TIMEZONE':
        return (
          <Form.Select
            value={setting.settingValue || setting.defaultValue}
            onChange={(e) => handleSettingChange(setting.settingKey, e.target.value)}
            disabled={!setting.isEditable}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </Form.Select>
        );
      case 'BOOLEAN':
        return (
          <Form.Check
            type="switch"
            id={`setting-${setting.settingKey}`}
            label={setting.settingValue === 'true' ? 'Enabled' : 'Disabled'}
            checked={setting.settingValue === 'true'}
            onChange={(e) => handleSettingChange(setting.settingKey, e.target.checked.toString())}
            disabled={!setting.isEditable}
          />
        );
      case 'NUMBER':
        return (
          <Form.Control
            type="number"
            value={setting.settingValue || setting.defaultValue}
            onChange={(e) => handleSettingChange(setting.settingKey, e.target.value)}
            disabled={!setting.isEditable}
          />
        );
      default:
        return (
          <Form.Control
            type="text"
            value={setting.settingValue || setting.defaultValue}
            onChange={(e) => handleSettingChange(setting.settingKey, e.target.value)}
            disabled={!setting.isEditable}
            placeholder={setting.defaultValue}
          />
        );
    }
  };

  if (settingsLoading || timezonesLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading system settings...</span>
      </div>
    );
  }

  if (settingsError) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Settings</Alert.Heading>
        <p>Failed to load system settings. Please try again.</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Settings</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={handleInitializeDefaults}
            disabled={initializeDefaultsMutation.isPending}
            className="me-2"
          >
            {initializeDefaultsMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Initializing...
              </>
            ) : (
              'Initialize Defaults'
            )}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {settings.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No System Settings Found</h5>
            <p className="text-muted">Click "Initialize Defaults" to create default system settings.</p>
            <Button variant="primary" onClick={handleInitializeDefaults}>
              Initialize Default Settings
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {settings.map((setting) => (
            <Col md={6} lg={4} key={setting.settingKey} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{setting.settingKey}</h6>
                  <div>
                    <Badge bg={setting.isEditable ? 'success' : 'secondary'}>
                      {setting.isEditable ? 'Editable' : 'Read-only'}
                    </Badge>
                    <Badge bg="info" className="ms-1">
                      {setting.settingType}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Value</Form.Label>
                    {getSettingTypeComponent(setting)}
                    {setting.description && (
                      <Form.Text className="text-muted">
                        {setting.description}
                      </Form.Text>
                    )}
                  </Form.Group>
                  {setting.defaultValue && (
                    <div className="text-muted small">
                      <strong>Default:</strong> {setting.defaultValue}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
