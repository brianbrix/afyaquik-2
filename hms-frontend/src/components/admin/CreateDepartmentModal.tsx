import React, { useState } from 'react';
import { FormModal } from '../shared/FormModal';

interface CreateDepartmentModalProps { 
  show: boolean; 
  onClose: () => void; 
  onCreate: (departmentId: string, displayName: string, description?: string) => void;
}

export const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({ show, onClose, onCreate }) => {
  const [departmentId, setDepartmentId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(departmentId, displayName, description || undefined);
    // Reset form
    setDepartmentId('');
    setDisplayName('');
    setDescription('');
  };

  const handleClose = () => {
    setDepartmentId('');
    setDisplayName('');
    setDescription('');
    onClose();
  };

  return (
    <FormModal
      show={show}
      onHide={handleClose}
      onSubmit={submit}
      title="Create Department"
      submitLabel="Create"
      cancelLabel="Cancel"
      disableSubmit={!departmentId.trim() || !displayName.trim()}
    >
      <div className="mb-3">
        <label className="form-label">Department ID *</label>
        <input 
          type="text" 
          className="form-control" 
          value={departmentId} 
          onChange={(e) => setDepartmentId(e.target.value)}
          placeholder="e.g., cardiology, emergency"
          required
        />
        <div className="form-text">Unique identifier for the department (lowercase, no spaces)</div>
      </div>
      <div className="mb-3">
        <label className="form-label">Display Name *</label>
        <input 
          type="text" 
          className="form-control" 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g., Cardiology, Emergency Department"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea 
          className="form-control" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of the department"
          rows={3}
        />
      </div>
    </FormModal>
  );
};
