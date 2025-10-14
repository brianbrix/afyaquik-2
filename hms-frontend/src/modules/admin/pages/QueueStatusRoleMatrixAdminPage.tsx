import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spinner, Form } from "react-bootstrap";
import { fetchRoles, AdminRole } from "../../../services/roleApi";
import { fetchQueueStatuses, fetchQueueStatusRoleMatrix, updateRoleQueueStatuses } from "../../../services/queueStatusRoleApi";

export default function QueueStatusRoleMatrixAdminPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [rolesData, statusesData, matrixData] = await Promise.all([
        fetchRoles(),
        fetchQueueStatuses(),
        fetchQueueStatusRoleMatrix()
      ]);
  setRoles(rolesData);
      setStatuses(statusesData);
      setMatrix(matrixData);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggle = (role: string, status: string) => {
    setMatrix(prev => {
      // Always create a new Set<string> to avoid mutating state
      const prevSet: Set<string> = prev[role] ? new Set<string>(Array.from(prev[role])) : new Set<string>();
      if (prevSet.has(status)) {
        prevSet.delete(status);
      } else {
        prevSet.add(status);
      }
      return { ...prev, [role]: prevSet };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateRoleQueueStatuses(matrix);
    setSaving(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Card className="mt-4">
      <Card.Body>
        <h5>Queue Status Visibility by Role</h5>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>Role</th>
              {statuses.map(status => (
                <th key={status}>{status}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.roleKey}>
                <td>
                  <span className="fw-semibold">{role.displayName}</span>
                  <div className="text-muted small">{role.roleKey}</div>
                </td>
                {statuses.map(status => (
                  <td key={status} className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={matrix[role.roleKey]?.has(status) || false}
                      onChange={() => handleToggle(role.roleKey, status)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? "Saving..." : "Save"}
        </Button>
      </Card.Body>
    </Card>
  );
}
