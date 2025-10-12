import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotificationTemplates, createNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate } from "../../../services/notificationTemplateApi";
import type { NotificationTemplate, NotificationLevel } from "../../../types/notification";
import { Button, Table, Form, Spinner, Badge } from "react-bootstrap";
import { FormModal } from "../../../components/shared/FormModal";

const LEVEL_OPTIONS: NotificationLevel[] = ["INFO", "SUCCESS", "WARNING", "ERROR"];

export function NotificationTemplatesAdminPage() {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["notificationTemplates"],
    queryFn: fetchNotificationTemplates
  });
  const createMutation = useMutation({
    mutationFn: createNotificationTemplate,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] })
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: Partial<NotificationTemplate> & { id: number }) => updateNotificationTemplate(id, payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] })
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNotificationTemplate,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] })
  });

  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<NotificationTemplate | null>(null);
  const [form, setForm] = React.useState<Partial<NotificationTemplate>>({});

  function openCreate() {
    setEditing(null);
    setForm({ code: "", name: "", level: "INFO", content: "", variables: "", enabled: true });
    setShowModal(true);
  }
  function openEdit(template: NotificationTemplate) {
    setEditing(template);
    setForm({ ...template });
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm({});
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form });
    } else {
      createMutation.mutate(form);
    }
    closeModal();
  }
  function handleDelete(id: number) {
    if (window.confirm("Delete this template?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="container py-4">
      <h2>Notification Templates</h2>
      <Button variant="primary" className="mb-3" onClick={openCreate}>New Template</Button>
      {isLoading ? <Spinner animation="border" /> : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Level</th>
              <th>Enabled</th>
              <th>Variables</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl: NotificationTemplate) => (
              <tr key={tpl.id}>
                <td>{tpl.code}</td>
                <td>{tpl.name}</td>
                <td><Badge bg={tpl.level === "ERROR" ? "danger" : tpl.level === "WARNING" ? "warning" : tpl.level === "SUCCESS" ? "success" : "info"}>{tpl.level}</Badge></td>
                <td>{tpl.enabled ? "Yes" : "No"}</td>
                <td>{tpl.variables}</td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(tpl)}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(tpl.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <FormModal
        show={showModal}
        onHide={closeModal}
        onSubmit={handleSubmit}
        title={(editing ? "Edit" : "New") + " Notification Template"}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitLabel="Save"
        cancelLabel="Cancel"
        disableSubmit={!(form.code && form.name && form.content)}
      >
        <Form.Group className="mb-2">
          <Form.Label>Code</Form.Label>
          <Form.Control name="code" value={form.code || ""} onChange={handleChange} required disabled={!!editing} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name || ""} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Level</Form.Label>
          <Form.Select name="level" value={form.level || "INFO"} onChange={handleChange}>
            {LEVEL_OPTIONS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Variables (comma-separated)</Form.Label>
          <Form.Control name="variables" value={form.variables || ""} onChange={handleChange} />
        </Form.Group>
        {/* Show available variables if any */}
        {form.variables && form.variables.trim() && (
          <div className="mb-2">
            <div style={{ fontSize: '0.95em', color: '#555' }}>
              <strong>Available variables:</strong>
              <ul style={{ marginBottom: 0 }}>
                {form.variables.split(',').map(v => v.trim()).filter(Boolean).map(v => (
                  <li key={v}><code>{`{{${v}}}`}</code></li>
                ))}
              </ul>
              <div style={{ fontSize: '0.92em', color: '#888', marginTop: 4 }}>
                Use variables in the content as <code>{'{{variableName}}'}</code>.<br />
                Example: <code>{'Hello, {{patientName}}!'}</code>
              </div>
            </div>
          </div>
        )}
        <Form.Group className="mb-2">
          <Form.Label>Content</Form.Label>
          <Form.Control as="textarea" name="content" value={form.content || ""} onChange={handleChange} rows={4} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Check type="checkbox" name="enabled" label="Enabled" checked={!!form.enabled} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Preview</Form.Label>
          <Form.Control as="textarea" value={form.content || ""} readOnly rows={2} />
        </Form.Group>
      </FormModal>
    </div>
  );
}
