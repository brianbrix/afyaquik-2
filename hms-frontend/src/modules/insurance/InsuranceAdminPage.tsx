import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { apiClient } from "../../services/apiClient";

// Types for DTOs
export type InsurancePlanDto = {
  id: number;
  name: string;
  description?: string;
  providerId: number;
  providerName: string;
};

export type InsuranceProviderDto = {
  id: number;
  name: string;
  plans: InsurancePlanDto[];
};

// API helpers
async function fetchProviders(): Promise<InsuranceProviderDto[]> {
  const res = await apiClient.get("/insurance/providers");
  return res.data?.data ?? res.data;
}

async function createProvider(payload: { name: string }): Promise<InsuranceProviderDto> {
  const res = await apiClient.post("/insurance/providers", payload);
  return res.data?.data ?? res.data;
}

async function updateProvider(id: number, payload: { name: string }): Promise<InsuranceProviderDto> {
  const res = await apiClient.put(`/insurance/providers/${id}`, payload);
  return res.data?.data ?? res.data;
}

async function deleteProvider(id: number): Promise<void> {
  await apiClient.delete(`/insurance/providers/${id}`);
}

async function createPlan(providerId: number, payload: { name: string; description?: string }): Promise<InsurancePlanDto> {
  const res = await apiClient.post(`/insurance/providers/${providerId}/plans`, payload);
  return res.data?.data ?? res.data;
}

async function updatePlan(planId: number, payload: { name: string; description?: string }): Promise<InsurancePlanDto> {
  const res = await apiClient.put(`/insurance/providers/plans/${planId}`, payload);
  return res.data?.data ?? res.data;
}

async function deletePlan(planId: number): Promise<void> {
  await apiClient.delete(`/insurance/providers/plans/${planId}`);
}

export function InsuranceAdminPage() {
  const [providers, setProviders] = useState<InsuranceProviderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<InsuranceProviderDto | null>(null);
  const [providerName, setProviderName] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{ plan: InsurancePlanDto; providerId: number } | null>(null);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planProviderId, setPlanProviderId] = useState<number | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (e: any) {
      setError(e.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProviders(); }, []);

  // Provider CRUD
  const handleShowProviderModal = (provider?: InsuranceProviderDto) => {
    setEditingProvider(provider || null);
    setProviderName(provider?.name || "");
    setShowProviderModal(true);
  };
  const handleSaveProvider = async () => {
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, { name: providerName });
      } else {
        await createProvider({ name: providerName });
      }
      setShowProviderModal(false);
      loadProviders();
    } catch (e: any) {
      setError(e.message || "Failed to save provider");
    }
  };
  const handleDeleteProvider = async (id: number) => {
    if (!window.confirm("Delete this provider?")) return;
    try {
      await deleteProvider(id);
      loadProviders();
    } catch (e: any) {
      setError(e.message || "Failed to delete provider");
    }
  };

  // Plan CRUD
  const handleShowPlanModal = (providerId: number, plan?: InsurancePlanDto) => {
    setEditingPlan(plan ? { plan, providerId } : null);
    setPlanName(plan?.name || "");
    setPlanDescription(plan?.description || "");
    setPlanProviderId(providerId);
    setShowPlanModal(true);
  };
  const handleSavePlan = async () => {
    if (!planProviderId) return;
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.plan.id, { name: planName, description: planDescription });
      } else {
        await createPlan(planProviderId, { name: planName, description: planDescription });
      }
      setShowPlanModal(false);
      loadProviders();
    } catch (e: any) {
      setError(e.message || "Failed to save plan");
    }
  };
  const handleDeletePlan = async (planId: number) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deletePlan(planId);
      loadProviders();
    } catch (e: any) {
      setError(e.message || "Failed to delete plan");
    }
  };

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body>
        <h4>Insurance Providers & Plans</h4>
        <Button variant="primary" className="mb-3" onClick={() => handleShowProviderModal()}>Add Provider</Button>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? <Spinner animation="border" /> : (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Plans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td>{provider.name}</td>
                  <td>
                    <ul className="mb-0">
                      {provider.plans.map((plan) => (
                        <li key={plan.id}>
                          <b>{plan.name}</b> {plan.description && <span className="text-muted">({plan.description})</span>}
                          <Button size="sm" variant="outline-secondary" className="ms-2" onClick={() => handleShowPlanModal(provider.id, plan)}>Edit</Button>
                          <Button size="sm" variant="outline-danger" className="ms-1" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" variant="outline-primary" className="mt-1" onClick={() => handleShowPlanModal(provider.id)}>Add Plan</Button>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-secondary" onClick={() => handleShowProviderModal(provider)}>Edit</Button>{' '}
                    <Button size="sm" variant="outline-danger" onClick={() => handleDeleteProvider(provider.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      {/* Provider Modal */}
      <Modal show={showProviderModal} onHide={() => setShowProviderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProvider ? "Edit Provider" : "Add Provider"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control value={providerName} onChange={e => setProviderName(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProviderModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveProvider}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Plan Modal */}
      <Modal show={showPlanModal} onHide={() => setShowPlanModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPlan ? "Edit Plan" : "Add Plan"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={planName} onChange={e => setPlanName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={planDescription} onChange={e => setPlanDescription(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlanModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePlan}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
