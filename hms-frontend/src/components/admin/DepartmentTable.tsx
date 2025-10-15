import React, { useState } from 'react';
import { useAdminDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../services/adminApi';
import { DepartmentTag } from './DepartmentTag';
import { EditDepartmentModal } from './EditDepartmentModal';
import { CreateDepartmentModal } from './CreateDepartmentModal';

export const DepartmentTable: React.FC = () => {
  const { data: depts, isLoading, error } = useAdminDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [editing, setEditing] = useState<any|undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const onSave = (name: string, description?: string) => {
    if (!editing) return;
    updateDepartment.mutate({ id: editing.id, displayName: name, description }, { onSuccess: () => setEditing(undefined) });
  };

  const onCreate = (departmentId: string, displayName: string, description?: string) => {
    createDepartment.mutate({ departmentId, displayName, description }, { onSuccess: () => setShowCreateModal(false) });
  };

  const onDelete = (d: any) => {
    if (!window.confirm(`Delete department ${d.departmentId}?`)) return;
    deleteDepartment.mutate(d.id);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Departments</h5>
        <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)}>+ New Department</button>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-danger">Failed to load departments</div>}
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Tag</th>
              <th style={{width:160}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depts?.map(d => (
              <tr key={d.id}>
                <td><code>{d.departmentId}</code></td>
                <td>{d.displayName}</td>
                <td className="small text-muted">{d.description || '-'}</td>
                <td><DepartmentTag dept={d} /></td>
                <td className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={()=>setEditing(d)}>Edit</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(d)} disabled={deleteDepartment.isPending}>Del</button>
                </td>
              </tr>
            ))}
            {!isLoading && !depts?.length && (
              <tr><td colSpan={5} className="text-center py-4 text-muted small">No departments defined</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <EditDepartmentModal show={!!editing} department={editing} onClose={()=>setEditing(undefined)} onSave={onSave} />
      <CreateDepartmentModal show={showCreateModal} onClose={()=>setShowCreateModal(false)} onCreate={onCreate} />
    </div>
  );
};
