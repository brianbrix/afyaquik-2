import React, { useEffect, useState } from 'react';
import { AdminDepartment, useUpdateDepartment } from '../../services/adminApi';
import { FormModal } from '../shared/FormModal';

interface EditDepartmentModalProps { show: boolean; onClose: () => void; department?: AdminDepartment; onSave?: (displayName: string, description?: string)=>void; }

export const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ show, onClose, department, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const updateDepartment = useUpdateDepartment();
  useEffect(()=>{ if (show) { setDisplayName(department?.displayName||''); setDescription(department?.description||''); } }, [show, department]);
  if (!show || !department) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDepartment.mutate({ id: department.id, displayName, description: description||undefined }, { onSuccess: () => { onSave?.(displayName, description); onClose(); } });
  };

  return (
    <FormModal
      show={show}
      onHide={onClose}
      onSubmit={submit}
      title="Edit Department"
      isSubmitting={updateDepartment.isPending}
      submitLabel={updateDepartment.isPending ? 'Saving...' : 'Save'}
      cancelLabel="Cancel"
      disableSubmit={updateDepartment.isPending || !displayName.trim()}
    >
      <div className="mb-3">
        <label className="form-label form-label-sm">Code</label>
        <input className="form-control form-control-sm" value={department.departmentId} disabled />
      </div>
      <div className="mb-3">
        <label className="form-label form-label-sm">Display Name</label>
        <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label form-label-sm">Description</label>
        <textarea className="form-control form-control-sm" value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
    </FormModal>
  );
};
