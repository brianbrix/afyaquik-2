import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Button, Spinner, Form, InputGroup, FormControl } from "react-bootstrap";
import { fetchRoles, AdminRole } from "../../../services/roleApi";
import { fetchQueueStatuses, fetchQueueStatusRoleMatrix, updateRoleQueueStatuses } from "../../../services/queueStatusRoleApi";

export default function QueueStatusRoleMatrixAdminPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");

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

  // Filter statuses based on search
  const filteredStatuses = useMemo(() => {
    if (!statusSearch.trim()) return statuses;
    return statuses.filter(status => 
      status.toLowerCase().includes(statusSearch.toLowerCase())
    );
  }, [statuses, statusSearch]);

  if (loading) return <Spinner animation="border" />;

  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Queue Status Visibility by Role</h5>
          <div className="d-flex gap-2">
            <InputGroup style={{ width: '300px' }}>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <FormControl
                placeholder="Search statuses..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
              />
            </InputGroup>
            <Button onClick={handleSave} disabled={saving} variant="primary">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        
        <div className="table-responsive">
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Status</th>
                {roles.map(role => (
                  <th key={role.roleKey} className="text-center">
                    <div className="fw-semibold">{role.displayName}</div>
                    <div className="text-muted small">{role.roleKey}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.map(status => (
                <tr key={status}>
                  <td>
                    <span className="fw-semibold">{status}</span>
                  </td>
                  {roles.map(role => (
                    <td key={role.roleKey} className="text-center">
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
        </div>
        
        {filteredStatuses.length === 0 && statusSearch && (
          <div className="text-center text-muted py-3">
            No statuses found matching "{statusSearch}"
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
