import React, { useState } from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ShiftType } from '../../../types/shiftType';
import { fetchShiftTypes, createShiftType, updateShiftType, deleteShiftType } from '../../../services/shiftTypeAdminApi';

function ShiftTypeForm({ initial, onSave, onCancel }: {
  initial?: Partial<ShiftType>;
  onSave: (data: Omit<ShiftType, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [startTime, setStartTime] = useState(initial?.startTime || '08:00:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '16:00:00');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, description, startTime, endTime }); }}>
      <div className="mb-2">
        <label className="form-label">Name</label>
        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="form-label">Description</label>
        <input className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">Start Time</label>
        <input className="form-control" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="form-label">End Time</label>
        <input className="form-control" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" type="submit">Save</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function AdminShiftTypesPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'MANAGE_SHIFT_TYPES';
  const qc = useQueryClient();
  const { data: shiftTypes, isLoading, error } = useQuery({ queryKey: ['admin', 'shift-types'], queryFn: fetchShiftTypes });
  const createMutation = useMutation({ mutationFn: createShiftType, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shift-types'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, ...rest }: ShiftType) => updateShiftType(id, rest), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shift-types'] }) });
  const deleteMutation = useMutation({ mutationFn: deleteShiftType, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shift-types'] }) });

  const [editing, setEditing] = useState<ShiftType | null>(null);
  const [creating, setCreating] = useState(false);

  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin shift types.</div>;
  }

  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - Shift Types</h2>
      <p className="text-muted mb-4">Manage shift types: create, edit, and delete shift types with start/end times and display names.</p>
      {isLoading && <div>Loading shift types...</div>}
      {error && <div className="alert alert-danger">Error loading shift types.</div>}
      <div className="mb-3">
        {creating ? (
          <ShiftTypeForm
            onSave={data => { createMutation.mutate(data); setCreating(false); }}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <button className="btn btn-success" onClick={() => setCreating(true)}>Add Shift Type</button>
        )}
      </div>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shiftTypes?.map(st => (
            <tr key={st.id}>
              <td>{st.name}</td>
              <td>{st.description}</td>
              <td>{st.startTime}</td>
              <td>{st.endTime}</td>
              <td>
                {editing?.id === st.id ? (
                  <ShiftTypeForm
                    initial={st}
                    onSave={data => { updateMutation.mutate({ ...st, ...data }); setEditing(null); }}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => setEditing(st)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteMutation.mutate(st.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
