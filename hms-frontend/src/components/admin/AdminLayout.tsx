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
      <aside className="border-end bg-light" style={{width:280}}>
        <div className="p-3 border-bottom">
          <h5 className="mb-0 text-primary">
            <i className="bi bi-gear-fill me-2"></i>
            Admin Panel
          </h5>
          <small className="text-muted">System Configuration</small>
        </div>
        
        <nav className="p-3">
          {/* User Management Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-people-fill me-2"></i>
              User Management
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="users" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-person-lines-fill me-2"></i>
                Users
              </NavLink>
              <NavLink to="roles" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-shield-check me-2"></i>
                Roles
              </NavLink>
              <NavLink to="user-groups" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-people me-2"></i>
                User Groups
              </NavLink>
              <NavLink to="departments" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-building me-2"></i>
                Departments
              </NavLink>
            </div>
          </div>

          {/* System Configuration Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-gear me-2"></i>
              System Configuration
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="permissions" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-key-fill me-2"></i>
                Permissions
              </NavLink>
              <NavLink to="role-redirects" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-arrow-right-circle me-2"></i>
                Role Redirects
              </NavLink>
              <NavLink to="shift-types" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-clock me-2"></i>
                Shift Types
              </NavLink>
              <NavLink to="notification-templates" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-bell me-2"></i>
                Notifications
              </NavLink>
              <NavLink to="form-configuration" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-form me-2"></i>
                Form Configuration
              </NavLink>
              <NavLink to="system-settings" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-gear-fill me-2"></i>
                System Settings
              </NavLink>
            </div>
          </div>

          {/* Clinical Configuration Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-hospital me-2"></i>
              Clinical Configuration
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="triage-titles" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-clipboard-pulse me-2"></i>
                Triage Titles
              </NavLink>
              {/* Triage Items Management */}
              <NavLink to="triage-items" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-clipboard2-pulse me-2"></i>
                Triage Items
              </NavLink>
              <NavLink to="consultation-titles" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-clipboard-data me-2"></i>
                Consultation Titles
              </NavLink>
              <NavLink to="diagnostics" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-clipboard2-pulse me-2"></i>
                Diagnostics
              </NavLink>
              <NavLink to="queue-status-role-matrix" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-diagram-3 me-2"></i>
                Queue Matrix
              </NavLink>
            </div>
          </div>

          {/* Financial Configuration Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-currency-dollar me-2"></i>
              Financial Configuration
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="payment-methods" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-credit-card me-2"></i>
                Payment Methods
              </NavLink>
              <NavLink to="billing-items" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-list-ul me-2"></i>
                Billing Items
              </NavLink>
              <NavLink to="billing-item-categories" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-tags me-2"></i>
                Billing Categories
              </NavLink>
              {/* Currency management moved to System Settings */}
              <NavLink to="insurance" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-shield-check me-2"></i>
                Insurance
              </NavLink>
            </div>
          </div>

          {/* Inventory Management Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-boxes me-2"></i>
              Inventory Management
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="medications" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-capsule me-2"></i>
                Medications
              </NavLink>
              <NavLink to="inventory" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-boxes me-2"></i>
                Inventory Items
              </NavLink>
            </div>
          </div>

          {/* Analytics & Reports Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Analytics & Reports
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="analytics" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-speedometer2 me-2"></i>
                System Analytics
              </NavLink>
              <NavLink to="patient-visits" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-people me-2"></i>
                Patient Visits
              </NavLink>
              <NavLink to="audit-logs" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-journal-text me-2"></i>
                Audit Logs
              </NavLink>
            </div>
          </div>

          {/* Forms Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-file-text me-2"></i>
              Forms & Templates
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="forms/patient-intake" className={({isActive}) => `nav-link rounded ${isActive?'active bg-primary text-white':''}`}>
                <i className="bi bi-file-earmark-medical me-2"></i>
                Patient Intake Form
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>
      
      <main className="flex-grow-1 bg-light">
        <div className="p-4">
        <Outlet />
        </div>
      </main>
    </div>
  );
};
