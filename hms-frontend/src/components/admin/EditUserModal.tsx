import React, { useEffect, useState } from 'react';
import { AdminUser, useAdminRoles, useUpdateUser, useUpdateUserRoles, useAdminUsers } from '../../services/adminApi';
import { SearchableStaffSelect } from '../shared/SearchableStaffSelect';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

interface EditUserModalProps { show: boolean; onClose: () => void; user?: AdminUser; }

export const EditUserModal: React.FC<EditUserModalProps> = ({ show, onClose, user }) => {
  const { data: roles } = useAdminRoles();
  const { data: allUsers } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const updateUser = useUpdateUser();
  const updateUserRoles = useUpdateUserRoles();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|undefined>();

  useEffect(()=>{
    if (show && user) {
      setDisplayName(user.displayName);
      setEmail(user.email||'');
      setEnabled(user.enabled);
      setSelectedRoles(user.roles?.map(r => r.roleKey || r.displayName) || []);
      
      // Set supervisor if available
      if (user.supervisorId && allUsers) {
        const supervisor = allUsers.find(u => u.id === user.supervisorId);
        if (supervisor) {
          setSelectedSupervisor({
            id: supervisor.id,
            username: supervisor.username,
            displayName: supervisor.displayName,
            roles: supervisor.roles?.map(r => r.roleKey || r.displayName) || [],
            departments: [] // Add departments if available
          });
        }
      } else {
        setSelectedSupervisor(null);
      }
      
      setError(undefined);
    }
  }, [show, user, allUsers]);

  if (!show || !user) return null;

  const toggleRole = (key: string) => {
    // Check if user is trying to remove ADMIN role from themselves
    if (currentUser && currentUser.username === user?.username && key === 'ADMIN' && selectedRoles.includes('ADMIN')) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove ADMIN Role',
        text: 'You cannot remove the ADMIN role from your own account. Ask another administrator to do this.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setSelectedRoles(prev => prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is trying to disable themselves
    if (currentUser && currentUser.username === user.username && !enabled) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Disable Self',
        text: 'You cannot disable your own account. Ask another administrator to do this.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Check if user is tenant super admin
    if (user.isTenantSuperAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Modify Tenant Super Admin',
        text: 'This user is a tenant super admin and cannot be modified. Contact system administrator.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setSaving(true);
    try {
      await updateUser.mutateAsync({ 
        id: user.id, 
        displayName, 
        email: email||undefined, 
        enabled,
        supervisorId: selectedSupervisor?.id || null,
        supervisorDisplayName: selectedSupervisor?.displayName || null
      });
      await updateUserRoles.mutateAsync({ id: user.id, roleKeys: selectedRoles });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{background:'rgba(0,0,0,0.4)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit User</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label form-label-sm">Username</label>
                  <input className="form-control form-control-sm" value={user.username} disabled />
                </div>
                <div className="col-md-4">
                  <label className="form-label form-label-sm">Display Name</label>
                  <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label form-label-sm">Email</label>
                  <input type="email" className="form-control form-control-sm" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label form-label-sm">Enabled</label>
                  <div>
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      checked={enabled} 
                      onChange={e=>setEnabled(e.target.checked)}
                      disabled={!!(currentUser && currentUser.username === user.username)}
                      title={currentUser && currentUser.username === user.username ? 'Cannot disable your own account' : ''}
                    />
                    {currentUser && currentUser.username === user.username && (
                      <small className="text-muted d-block">
                        <i className="bi bi-lock me-1"></i>
                        Cannot disable self
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <hr />
              <div className="row g-2">
                <div className="col-12">
                  <label className="form-label form-label-sm">Supervisor/Manager</label>
                  <SearchableStaffSelect
                    value={selectedSupervisor}
                    onChange={setSelectedSupervisor}
                    placeholder="Select supervisor..."
                    disabled={saving}
                  />
                  <small className="text-muted">Select a user who will be this user's supervisor/manager</small>
                </div>
              </div>
              <hr />
              <div>
                <div className="fw-semibold small mb-2">Roles</div>
                <div className="d-flex flex-wrap gap-2">
                  {roles?.map(r => {
                    const isCurrentUser = currentUser && currentUser.username === user.username;
                    const isAdminRole = r.roleKey === 'ADMIN';
                    const isDisabled = isCurrentUser && isAdminRole && selectedRoles.includes('ADMIN');
                    
                    return (
                      <button 
                        type="button" 
                        key={r.id} 
                        className={`btn btn-sm ${selectedRoles.includes(r.roleKey)?'btn-primary':'btn-outline-secondary'} ${isDisabled ? 'disabled' : ''}`}
                        onClick={()=>toggleRole(r.roleKey)}
                        disabled={!!isDisabled}
                        title={isDisabled ? 'Cannot remove ADMIN role from your own account' : ''}
                      >
                        {r.displayName}
                        {isDisabled && <i className="bi bi-lock ms-1"></i>}
                      </button>
                    );
                  })}
                  {!roles?.length && <span className="text-muted small">No roles defined.</span>}
                </div>
                {currentUser && currentUser.username === user.username && (
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    You cannot remove the ADMIN role from your own account.
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
