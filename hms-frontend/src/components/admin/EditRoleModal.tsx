import React, { useEffect, useState } from 'react';
import { AdminRole, useUpdateRole } from '../../services/adminApi';

interface EditRoleModalProps { show: boolean; onClose: () => void; role?: AdminRole; onSave?: (displayName: string) => void; }

export const EditRoleModal: React.FC<EditRoleModalProps> = ({ show, onClose, role, onSave }) => {
  const [displayName, setDisplayName] = useState(role?.displayName || '');
  const updateRole = useUpdateRole();
  useEffect(()=>{ if (show) setDisplayName(role?.displayName || ''); }, [show, role]);
  if (!show || !role) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRole.mutate({ id: role.id, displayName }, { onSuccess: () => { onSave?.(displayName); onClose(); } });
  };

  return (
    <div className="modal d-block" style={{background:'rgba(0,0,0,0.4)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Role</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label form-label-sm">Role Key</label>
                <input className="form-control form-control-sm" value={role.roleKey} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label form-label-sm">Display Name</label>
                <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={updateRole.isPending}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={updateRole.isPending}>{updateRole.isPending?'Saving...':'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
