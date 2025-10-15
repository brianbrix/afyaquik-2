import React, { useMemo, useState } from 'react';
import { useAdminUsers, useUpdateUser, useUpdateUserRoles, useDeleteUser } from '../../services/adminApi';
import { useQueryClient } from '@tanstack/react-query';
import { RoleBadge } from './RoleBadge';
import { StatusToggle } from './StatusToggle';
import { UserFormModal } from './UserFormModal';
import { EditUserModal } from './EditUserModal';
import { profileApi } from '../../services/profileApi';
import { useMutation } from '@tanstack/react-query';
import { ReactPaginateComponent } from '../shared/ReactPaginate';
import { Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

export const UserDirectory: React.FC = () => {
  const { data: users, isLoading, error } = useAdminUsers();
  const qc = useQueryClient();
  const updateUser = useUpdateUser();
  const updateRoles = useUpdateUserRoles();
  const deleteUser = useDeleteUser();
  const [q, setQ] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any|undefined>();
  const [profileStatus, setProfileStatus] = useState<Record<string, boolean>>({});

  // Profile creation mutation
  const createProfileMutation = useMutation({
    mutationFn: (userData: { username: string; email: string; firstName: string; lastName: string }) => 
      profileApi.createFromUser(userData),
    onSuccess: (data, variables) => {
      setProfileStatus(prev => ({ ...prev, [variables.username]: true }));
      Swal.fire('Success', `Profile created for ${variables.username}`, 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', `Failed to create profile: ${error.message}`, 'error');
    }
  });

  // Check profile status for users
  React.useEffect(() => {
    if (users) {
      users.forEach(user => {
        profileApi.checkExists(user.username)
          .then(exists => {
            setProfileStatus(prev => ({ ...prev, [user.username]: exists }));
          })
          .catch(() => {
            setProfileStatus(prev => ({ ...prev, [user.username]: false }));
          });
      });
    }
  }, [users]);

  const handleEnableProfile = async (user: any) => {
    const result = await Swal.fire({
      title: 'Enable Profile?',
      text: `Create a profile for ${user.username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create profile',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      // Extract first and last name from displayName
      const nameParts = user.displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      createProfileMutation.mutate({
        username: user.username,
        email: user.email,
        firstName,
        lastName
      });
    }
  };

  const filtered = useMemo(() => {
    if (!users) return [];
    const term = q.toLowerCase();
    return users.filter(u => !term || u.username.toLowerCase().includes(term) || u.displayName.toLowerCase().includes(term));
  }, [users, q]);

  // Client-side pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const toggleEnabled = (u: any) => {
    const prev = users;
    const optimistic = users?.map(x => x.id === u.id ? { ...x, enabled: !x.enabled } : x) || [];
    // optimistic update
    qc.setQueryData(['admin','users'], optimistic);
    updateUser.mutate(
      { id: u.id, displayName: u.displayName, email: u.email, enabled: !u.enabled },
      {
        onError: () => {
            qc.setQueryData(['admin','users'], prev);
        },
        onSettled: () => {
          qc.invalidateQueries({ queryKey: ['admin','users'] });
        }
      }
    );
  };

  const onDelete = (u: any) => {
    if (!window.confirm(`Delete user ${u.username}? This can be undone only by backend restore.`)) return;
    deleteUser.mutate(u.id);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Users</h5>
        <div className="d-flex gap-2">
          <input className="form-control form-control-sm" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={()=>setShowCreate(true)}>+ New User</button>
        </div>
      </div>
      {isLoading && <div>Loading users...</div>}
      {error && <div className="text-danger">Failed to load users</div>}
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Roles</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th>Profile</th>
              <th style={{width:200}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(u => (
              <tr key={u.id}>
                <td><code>{u.username}</code></td>
                <td>{u.displayName}</td>
                <td className="small">
                  {u.roles && u.roles.length ? u.roles.map(r => <RoleBadge key={r.id||r.roleKey||r.displayName} role={(r as any).roleKey ? r : { roleKey: r.roleKey || r.displayName, displayName: r.displayName || r.roleKey }} />) : <span className="text-muted">none</span>}
                </td>
                <td>
                  {u.supervisorDisplayName ? (
                    <span className="badge bg-info">{u.supervisorDisplayName}</span>
                  ) : (
                    <span className="text-muted small">None</span>
                  )}
                </td>
                <td>
                  <StatusToggle enabled={u.enabled} onChange={() => toggleEnabled(u)} disabled={updateUser.isPending} />
                </td>
                <td>
                  {profileStatus[u.username] === undefined ? (
                    <span className="text-muted small">Checking...</span>
                  ) : profileStatus[u.username] ? (
                    <span className="badge bg-success">Enabled</span>
                  ) : (
                    <span className="badge bg-secondary">Disabled</span>
                  )}
                </td>
                <td className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={()=>setEditing(u)}>Edit</button>
                  {!profileStatus[u.username] && (
                    <button 
                      className="btn btn-outline-primary btn-sm" 
                      onClick={() => handleEnableProfile(u)}
                      disabled={createProfileMutation.isPending}
                    >
                      Enable Profile
                    </button>
                  )}
                  <button className="btn btn-outline-danger btn-sm" onClick={()=>onDelete(u)} disabled={deleteUser.isPending}>Del</button>
                </td>
              </tr>
            ))}
            {!paginatedUsers.length && !isLoading && (
              <tr><td colSpan={7} className="text-center text-muted small py-4">No users match</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination and Info */}
      <Row className="align-items-center mt-3">
        <Col md={6}>
          <div className="text-muted small">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length} users
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 small">Show:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0); // Reset to first page when changing page size
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="small text-muted">entries</span>
            </div>
            <ReactPaginateComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </Col>
      </Row>
      
      <UserFormModal show={showCreate} onClose={()=>setShowCreate(false)} />
      <EditUserModal show={!!editing} user={editing} onClose={()=>setEditing(undefined)} />
    </div>
  );
};
