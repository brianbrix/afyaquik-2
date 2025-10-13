import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Button, Spinner, Modal } from "react-bootstrap";
import { apiClient } from "../../services/apiClient";

interface ApiResponse<T> {
  status: string;
  data: T;
  errors?: any;
  meta?: any;
  timestamp?: string;
}
interface InsuranceProviderDto {
  id: number;
  name: string;
  plans: InsurancePlanDto[];
}

interface InsurancePlanDto {
  id: number;
  name: string;
  description?: string;
}

interface InsuranceDetailsFormProps {
  onSave: (data: InsuranceFormData) => void;
  initialData?: InsuranceFormData;
  show: boolean;
  onHide: () => void;
  title?: string;
}

export interface InsuranceFormData {
  providerId?: number;
  planId?: number;
  policyNumber?: string;
  coverageType?: string;
  expiryDate?: string;
}

export const InsuranceDetailsForm: React.FC<InsuranceDetailsFormProps> = ({ onSave, initialData, show, onHide, title }) => {
  const [providers, setProviders] = useState<InsuranceProviderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<number | undefined>(initialData?.providerId);
  const [planId, setPlanId] = useState<number | undefined>(initialData?.planId);
  const [policyNumber, setPolicyNumber] = useState(initialData?.policyNumber || "");
  const [coverageType, setCoverageType] = useState(initialData?.coverageType || "");
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || "");
  const [saving, setSaving] = useState(false);

  // Reset form fields to initialData when modal opens or initialData changes
  useEffect(() => {
    if (show) {
      setProviderId(initialData?.providerId);
      setPlanId(initialData?.planId);
      setPolicyNumber(initialData?.policyNumber || "");
      setCoverageType(initialData?.coverageType || "");
      setExpiryDate(initialData?.expiryDate || "");
    }
  }, [show, initialData]);

  useEffect(() => {
    setLoading(true);
    apiClient.get<ApiResponse<InsuranceProviderDto[]>>("/insurance/providers?withPlans=true")
      .then(res => {
        const arr = res.data && Array.isArray(res.data.data) ? res.data.data : [];
        setProviders(arr);
        console.log("Fetched providers:", arr);
      })
      .finally(() => setLoading(false));
  }, []);

  const plans = useMemo(() => {
    if (!Array.isArray(providers)) return [];
    return providers.find(p => p.id === providerId)?.plans || [];
  }, [providers, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ providerId, planId, policyNumber, coverageType, expiryDate });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title || 'Insurance Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Row className="g-2">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    name="insuranceProvider"
                    id="insuranceProviderSelect"
                    value={providerId || ""}
                    onChange={e => {
                      setProviderId(e.target.value ? Number(e.target.value) : undefined);
                      setPlanId(undefined);
                    }}
                    required
                  >
                    <option value="">Select provider...</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Plan</Form.Label>
                  <Form.Select
                    name="insurancePlan"
                    id="insurancePlanSelect"
                    value={planId || ""}
                    onChange={e => setPlanId(e.target.value ? Number(e.target.value) : undefined)}
                    required={!!providerId}
                    disabled={!providerId}
                  >
                    <option value="">Select plan...</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Policy Number</Form.Label>
                  <Form.Control
                    name="policyNumber"
                    placeholder="Policy Number"
                    value={policyNumber}
                    onChange={e => setPolicyNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Coverage Type</Form.Label>
                  <Form.Control
                    name="coverageType"
                    placeholder="Coverage Type"
                    value={coverageType}
                    onChange={e => setCoverageType(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    name="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving || loading}>Cancel</Button>
          <Button size="sm" variant="primary" type="submit" disabled={saving || loading}>
            {saving ? <Spinner animation="border" size="sm" /> : "Save Insurance"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
