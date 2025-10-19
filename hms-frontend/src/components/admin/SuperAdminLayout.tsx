import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSuperAdminAuth } from '../../app/providers/SuperAdminAuthProvider';
import { Dropdown, Navbar, Container } from 'react-bootstrap';

// Super Admin layout shell. Assumes parent route path="/admin".
export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useSuperAdminAuth();

  return (
    <div className="d-flex flex-column" style={{minHeight:'calc(100vh - 56px)'}}>
      {/* Header with logout button */}
      <Navbar bg="danger" variant="dark" expand="lg" className="border-bottom">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <i className="bi bi-shield-fill me-2"></i>
            Super Admin Panel
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="super-admin-navbar" />
          <Navbar.Collapse id="super-admin-navbar" className="justify-content-end">
            <div className="d-flex align-items-center gap-2">
              <Dropdown align="end">
                <Dropdown.Toggle size="sm" variant="outline-light" className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{user?.displayName ?? user?.username ?? "Super Admin"}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-start">
                  <Dropdown.Header className="d-flex align-items-center">
                    <i className="bi bi-shield-fill me-2"></i>
                    Super Administrator
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="d-flex align-items-center text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        <aside className="border-end bg-light" style={{width:280}}>
          <div className="p-3 border-bottom">
            <h5 className="mb-0 text-danger">
              <i className="bi bi-shield-fill me-2"></i>
              System Management
            </h5>
            <small className="text-muted">System-wide Management</small>
          </div>
        
        <nav className="p-3">
          {/* Super Admin Management Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-shield-check me-2"></i>
              Super Admin Management
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="super-admin" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-person-gear me-2"></i>
                Super Admin Users
              </NavLink>
            </div>
          </div>

          {/* System Management Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-gear me-2"></i>
              System Management
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="tenant-management" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-building me-2"></i>
                Tenant Management
              </NavLink>
              <NavLink to="system-health" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-heart-pulse me-2"></i>
                System Health
              </NavLink>
              <NavLink to="system-settings" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-gear-fill me-2"></i>
                System Settings
              </NavLink>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-database me-2"></i>
              Data Management
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="database-records" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-table me-2"></i>
                Database Records
              </NavLink>
            </div>
          </div>

          {/* Analytics & Monitoring Section */}
          <div className="mb-4">
            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Analytics & Monitoring
            </h6>
            <div className="d-flex flex-column gap-1">
              <NavLink to="analytics" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-speedometer2 me-2"></i>
                System Analytics
              </NavLink>
              <NavLink to="audit-logs" className={({isActive}) => `nav-link rounded ${isActive?'active bg-danger text-white':''}`}>
                <i className="bi bi-journal-text me-2"></i>
                Audit Logs
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
    </div>
  );
};
