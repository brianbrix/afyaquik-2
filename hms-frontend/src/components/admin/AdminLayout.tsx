import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureFlags } from '../../services/configApi';
import { FEATURE_FLAGS } from '../../services/featureFlags';

// Basic Admin guard + layout shell. Assumes parent route path="/admin".
export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const { data: flags } = useFeatureFlags();
  const isAdmin = user?.roles?.some((r: any) => (typeof r === 'string' ? (r === 'ADMIN' || r === 'ROLE_ADMIN') : (r.roleKey === 'ADMIN' || r.roleKey === 'ROLE_ADMIN')));
  if (!isAdmin) {
    return <div className="container py-4"><div className="alert alert-danger">Access denied. Admin role required.</div></div>;
  }
  const flagEnabled = (key: string) => flags?.some(f => f.flagKey === key && f.enabled);
  return (
    <div className="d-flex" style={{minHeight:'calc(100vh - 56px)'}}>
      <aside className="border-end bg-light" style={{width:220}}>
        <div className="p-3 border-bottom fw-semibold small text-uppercase">Admin</div>
        <nav className="nav flex-column p-2 gap-1">
          <NavLink to="users" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Users</NavLink>
          <NavLink to="roles" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Roles</NavLink>
          <NavLink to="departments" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Departments</NavLink>
          <NavLink to="user-groups" className={({isActive}) => `nav-link ${isActive?'active':''}`}>User Groups</NavLink>
          <NavLink to="role-redirects" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Role Redirect URLs</NavLink>
          <NavLink to="permissions" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Permissions</NavLink>
          <NavLink to="shift-types" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Shift Types</NavLink>
          <NavLink to="notification-templates" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Notification Templates</NavLink>
          <NavLink to="forms/patient-intake" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Patient Intake Form</NavLink>
          <NavLink to="insurance" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Insurance</NavLink>
          <NavLink to="triage-titles" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Triage Titles</NavLink>
          <NavLink to="consultation-titles" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Consultation Titles</NavLink>
          <NavLink to="queue-status-role-matrix" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Queue Status Role Matrix</NavLink>
          <NavLink to="diagnostics" className={({isActive}) => `nav-link ${isActive?'active':''}`}>Diagnostics</NavLink>

          
        </nav>
      </aside>
      <main className="flex-grow-1 p-3">
        <Outlet />
      </main>
    </div>
  );
};
