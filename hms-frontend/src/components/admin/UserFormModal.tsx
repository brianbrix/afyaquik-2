import React, { useEffect, useState } from 'react';
import { useAdminRoles, useCreateUser } from '../../services/adminApi';
import { FormModal } from '../shared/FormModal';

interface UserFormModalProps { show: boolean; onClose: () => void; }

export const UserFormModal: React.FC<UserFormModalProps> = ({ show, onClose }) => {
  const { data: roles } = useAdminRoles();
  const createUser = useCreateUser();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    if (show) {
      setUsername(''); setDisplayName(''); setEmail(''); setPassword(''); setSelected([]); setError(undefined);
    }
  }, [show]);

  const toggleRole = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !displayName || !password) { setError('Required fields missing'); return; }
    createUser.mutate({ username, displayName, email: email||undefined, password, roleKeys: selected }, {
      onSuccess: () => onClose(),
      onError: (err: any) => setError(err?.message || 'Create failed')
    });
  };

  if (!show) return null;

  return (
    <FormModal
      show={show}
      onHide={onClose}
      onSubmit={submit}
      title="New User"
      isSubmitting={createUser.isPending}
      submitLabel={createUser.isPending ? 'Creating...' : 'Create User'}
      cancelLabel="Cancel"
      disableSubmit={createUser.isPending || !username.trim() || !displayName.trim() || !password.trim()}
      size="lg"
    >
      {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
      <div className="row g-2">
        <div className="col-md-4">
          <label className="form-label form-label-sm">Username *</label>
          <input className="form-control form-control-sm" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="form-label form-label-sm">Display Name *</label>
          <input className="form-control form-control-sm" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="form-label form-label-sm">Email</label>
          <input type="email" className="form-control form-control-sm" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="form-label form-label-sm">Password *</label>
          <input type="password" className="form-control form-control-sm" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
      </div>
      <hr />
      <div>
        <div className="fw-semibold small mb-1">Assign Roles</div>
        <div className="d-flex flex-wrap gap-2">
          {roles?.map(r => (
            <button key={r.id} type="button" className={`btn btn-sm ${selected.includes(r.roleKey) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={()=>toggleRole(r.roleKey)}>
              {r.displayName}
            </button>
          ))}
          {!roles?.length && <span className="text-muted small">No roles defined yet.</span>}
        </div>
      </div>
    </FormModal>
  );
};
