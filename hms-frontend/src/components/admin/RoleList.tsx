import React, { useState } from 'react';
import { useAdminRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../../services/adminApi';
import { DynamicFormSample } from './DynamicFormSample';
import { EditRoleModal } from './EditRoleModal';

export const RoleList: React.FC = () => {
  const { data: roles, isLoading, error } = useAdminRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const [roleKey, setRoleKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [err, setErr] = useState<string|undefined>();
  const [editing, setEditing] = useState<any|undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleKey || !displayName) { setErr('Both fields required'); return; }
    createRole.mutate({ roleKey, displayName }, {
      onSuccess: () => { setRoleKey(''); setDisplayName(''); setErr(undefined); },
      onError: (e: any) => setErr(e?.message || 'Create failed')
    });
  };

  const onSaveRole = (name: string) => {
    if (!editing) return;
    updateRole.mutate({ id: editing.id, displayName: name }, { onSuccess: () => setEditing(undefined) });
  };

  const onDelete = (r: any) => {
    if (!window.confirm(`Delete role ${r.roleKey}?`)) return;
    deleteRole.mutate(r.id);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Roles</h5>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-danger">Failed to load roles</div>}
      <div className="table-responsive mb-4">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th style={{width:160}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles?.map(r => (
              <tr key={r.id}>
                <td><code>{r.roleKey}</code></td>
                <td>{r.displayName}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={()=>setEditing(r)}>Edit</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(r)} disabled={deleteRole.isPending}>Del</button>
                </td>
              </tr>
            ))}
            {!isLoading && !roles?.length && <tr><td colSpan={3} className="text-center py-4 small text-muted">No roles defined</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card card-body p-3" onSubmit={submit}>
        <h6 className="mb-2">Add Role</h6>
        {err && <div className="alert alert-danger py-1 small mb-2">{err}</div>}
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label form-label-sm">Role Key</label>
            <input className="form-control form-control-sm" value={roleKey} onChange={e=>setRoleKey(e.target.value)} placeholder="e.g. BILLING" />
          </div>
            <div className="col-md-4">
            <label className="form-label form-label-sm">Display Name</label>
            <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Billing" />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary btn-sm w-100" disabled={createRole.isPending}>{createRole.isPending?'Saving...':'Add'}</button>
          </div>
        </div>
      </form>
      <EditRoleModal show={!!editing} role={editing} onClose={()=>setEditing(undefined)} onSave={onSaveRole} />
    </div>
  );
};
// Demo dynamic form schema (patient-intake) below list
export const RoleListWithFormDemo = () => (
  <div className="d-flex flex-column gap-4">
    <RoleList />
  </div>
);
