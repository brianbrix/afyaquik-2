
import { apiClient } from '../../../services/apiClient';
import { fetchUserGroups, UserGroup } from '../user-groups/userGroupApi';
import { fetchUsers, AdminUser } from '../../../services/adminApi';

// Ensure all necessary imports for React and Bootstrap components
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Form, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { fetchRoles, AdminRole } from '../../../services/adminApi';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';

export type Permission = {
  id: number;
  code: string;
  description: string;
};
export type PermissionMatrix = Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>;

async function fetchPermissions(): Promise<Permission[]> {
  const res = await apiClient.get('/api/v1/permissions');
  return res.data;
}
async function fetchMatrix(targetType: string, targetId: number): Promise<PermissionMatrix> {
  const res = await apiClient.get(`/api/v1/permissions/matrix`, { params: { targetType, targetId } });
  return res.data.permissions;
}
async function saveAssignment(targetType: string, targetId: number, code: string, state: 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED') {
  await apiClient.post('/api/v1/permissions/assignments', { targetType, targetId, permission: { code }, state });
}

const TARGET_TYPES = ['USER', 'GROUP', 'ROLE'] as const;

export default function PermissionMatrixAdminPage() {
  const { permissions: resolvedPermissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'MANAGE_PERMISSIONS';
  const [targetType, setTargetType] = useState<'USER' | 'GROUP' | 'ROLE'>('USER');
  const [targetId, setTargetId] = useState<number | null>(null);
  const [userOptions, setUserOptions] = useState<AdminUser[]>([]);
  const [groupOptions, setGroupOptions] = useState<UserGroup[]>([]);
  const [roleOptions, setRoleOptions] = useState<AdminRole[]>([]);
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);




  // Load options for select
  useEffect(() => {
    // Clear permissions and matrix when targetType changes
    setPermissionList([]);
    setMatrix({});
    setTargetId(null);
    if (targetType === 'USER') {
      fetchUsers().then(setUserOptions);
    } else if (targetType === 'GROUP') {
      fetchUserGroups().then(setGroupOptions);
    } else if (targetType === 'ROLE') {
      fetchRoles().then(setRoleOptions);
    }
  }, [targetType]);

  // Load permissions and matrix
  useEffect(() => {
    if (!targetId) {
      setPermissionList([]);
      setMatrix({});
      return;
    }
    setLoading(true);
    Promise.all([
      fetchPermissions(),
      fetchMatrix(targetType, targetId)
    ]).then(([perms, mat]) => {
      setPermissionList(perms);
      setMatrix(mat);
      setLoading(false);
    }).catch(e => {
      setError('Failed to load permissions');
      setLoading(false);
    });
  }, [targetType, targetId]);

  const handleChange = (code: string, state: 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED') => {
    setMatrix((m: PermissionMatrix) => ({ ...m, [code]: state }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(matrix).map(([code, state]) =>
          saveAssignment(targetType, targetId as number, code, state as 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED')
        )
      );
      setSaving(false);
    } catch (e) {
      setError('Failed to save assignments');
      setSaving(false);
    }
  };

  // Options for select
  let options: { value: number; label: string }[] = [];
  if (targetType === 'USER') options = userOptions.map((u: AdminUser) => ({ value: u.id, label: `${u.displayName} (${u.username})` }));
  if (targetType === 'GROUP') options = groupOptions.map((g: UserGroup) => ({ value: g.id!, label: g.name }));
  if (targetType === 'ROLE') options = roleOptions.map((r: AdminRole) => ({ value: r.id, label: r.displayName }));

  return (
    <div>
      <h2>Permission Matrix Admin</h2>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Select value={targetType} onChange={e => { setTargetType(e.target.value as any); setTargetId(null); }}>
            {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Select
            options={options}
            value={options.find(o => o.value === targetId) || null}
            onChange={(opt: { value: number; label: string } | null) => setTargetId(opt ? opt.value : null)}
            isClearable
            placeholder={`Select ${targetType.toLowerCase()}...`}
            isDisabled={options.length === 0}
            classNamePrefix="react-select"
          />
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button onClick={handleSave} disabled={saving || !targetId}>{saving ? <Spinner size="sm" animation="border" /> : 'Save All'}</Button>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Spinner animation="border" /> : (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Permission</th>
              <th>Description</th>
              <th>Unset</th>
              <th>Allowed</th>
              <th>Not Allowed</th>
            </tr>
          </thead>
          <tbody>
            {permissionList.map((p: Permission) => (
              <tr key={p.code}>
                <td>{p.code}</td>
                <td>{p.description}</td>
                <td><Form.Check type="radio" name={p.code} checked={matrix[p.code] === 'UNSET'} onChange={() => handleChange(p.code, 'UNSET')} /></td>
                <td><Form.Check type="radio" name={p.code} checked={matrix[p.code] === 'ALLOWED'} onChange={() => handleChange(p.code, 'ALLOWED')} /></td>
                <td><Form.Check type="radio" name={p.code} checked={matrix[p.code] === 'NOT_ALLOWED'} onChange={() => handleChange(p.code, 'NOT_ALLOWED')} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
