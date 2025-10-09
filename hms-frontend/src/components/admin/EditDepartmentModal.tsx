import React, { useEffect, useState } from 'react';
import { AdminDepartment, useUpdateDepartment } from '../../services/adminApi';

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
    <div className="modal d-block" style={{background:'rgba(0,0,0,0.4)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Department</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={updateDepartment.isPending}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={updateDepartment.isPending}>{updateDepartment.isPending?'Saving...':'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
