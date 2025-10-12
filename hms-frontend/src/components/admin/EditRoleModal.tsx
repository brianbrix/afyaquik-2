import React, { useEffect, useState } from 'react';
import { AdminRole, useUpdateRole } from '../../services/adminApi';
import { FormModal } from '../shared/FormModal';

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
    <FormModal
      show={show}
      onHide={onClose}
      onSubmit={submit}
      title="Edit Role"
      isSubmitting={updateRole.isPending}
      submitLabel={updateRole.isPending ? 'Saving...' : 'Save'}
      cancelLabel="Cancel"
      disableSubmit={updateRole.isPending || !displayName.trim()}
    >
      <div className="mb-3">
        <label className="form-label form-label-sm">Role Key</label>
        <input className="form-control form-control-sm" value={role.roleKey} disabled />
      </div>
      <div className="mb-3">
        <label className="form-label form-label-sm">Display Name</label>
        <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      </div>
    </FormModal>
  );
};
