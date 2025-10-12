import { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup } from "react-bootstrap";
import { FormModal } from "../shared/FormModal";
import { fetchRoleRedirects, upsertRoleRedirect, deleteRoleRedirect, RoleRedirectUrl } from "../../services/roleRedirectApi";
// Common URLs seeded in backend
const COMMON_ROLE_URLS = [
  { label: "Admin", value: "/admin" },
  { label: "Provider", value: "/provider" },
  { label: "Nurse", value: "/nurse" },
  { label: "Reception", value: "/reception" },
  { label: "Lab", value: "/lab" },
  { label: "Pharmacy", value: "/pharmacy" },
    { label: "Dashboard", value: "/dashboard" }
];
import { fetchRoles, AdminRole } from "../../services/adminApi";

export function RoleRedirectUrlTable() {
  const [redirects, setRedirects] = useState<RoleRedirectUrl[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoleRedirectUrl | null>(null);
  const [roleKey, setRoleKey] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRoleRedirects().then(setRedirects);
    fetchRoles().then(setRoles);
  }, []);

  const openModal = (item?: RoleRedirectUrl) => {
    setEditing(item ?? null);
    setRoleKey(item?.roleKey ?? "");
    setRedirectUrl(item?.redirectUrl ?? "");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setRoleKey("");
    setRedirectUrl("");
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertRoleRedirect(roleKey, redirectUrl);
      setRedirects(await fetchRoleRedirects());
      closeModal();
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (roleKey: string) => {
    setDeleting(roleKey);
    try {
      await deleteRoleRedirect(roleKey);
      setRedirects(await fetchRoleRedirects());
    } finally {
      setDeleting(null);
    }
  };
  // Show all roles, even if they don't have a redirect yet
  const allRoleKeys = Array.from(new Set([
    ...roles.map(r => r.roleKey),
    ...redirects.map(r => r.roleKey)
  ]));
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Per-Role Login Redirect URLs</h5>
        <Button variant="primary" onClick={() => openModal()}>Add Redirect</Button>
      </div>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Role</th>
            <th>Redirect URL</th>
            <th style={{width: 120}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allRoleKeys.length === 0 && (
            <tr><td colSpan={3} className="text-center text-muted">No roles available</td></tr>
          )}
          {allRoleKeys.map(roleKey => {
            const role = roles.find(r => r.roleKey === roleKey);
            const redirect = redirects.find(r => r.roleKey === roleKey);
            return (
              <tr key={roleKey}>
                <td>{role?.displayName || roleKey}</td>
                <td>{redirect?.redirectUrl || <span className="text-muted">(not set)</span>}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => openModal(
                      redirect || {
                        id: 0,
                        tenantId: '',
                        roleKey,
                        redirectUrl: ''
                      }
                    )}
                    disabled={saving}
                  >
                    Edit
                  </Button>{' '}
                  {redirect && (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(roleKey)} disabled={deleting === roleKey}>
                      {deleting === roleKey ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <FormModal
        show={showModal}
        onHide={closeModal}
        onSubmit={handleSave}
        title={editing ? "Edit Redirect" : "Add Redirect"}
        isSubmitting={saving}
        submitLabel={saving ? "Saving..." : "Save"}
        cancelLabel="Cancel"
      >
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select value={roleKey} onChange={e => setRoleKey(e.target.value)} disabled={!!editing} required>
            <option value="" disabled>Select role...</option>
            {roles.map(role => (
              <option key={role.roleKey} value={role.roleKey}>{role.displayName} ({role.roleKey})</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Redirect URL</Form.Label>
          <InputGroup>
            <Form.Select
              value={redirectUrl}
              onChange={e => setRedirectUrl(e.target.value)}
              required
            >
              <option value="">Select or enter a URL...</option>
              {COMMON_ROLE_URLS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
              ))}
            </Form.Select>
            <Form.Control
              type="text"
              value={redirectUrl}
              onChange={e => setRedirectUrl(e.target.value)}
              required
              placeholder="Or enter a custom URL (e.g. /dashboard)"
              style={{ marginTop: 8 }}
            />
          </InputGroup>
        </Form.Group>
      </FormModal>
    </div>
  );
}
