import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { ShiftAlertsBanner } from "../scheduling/ShiftAlertsBanner";
import { useShiftAction } from "../../hooks/useShiftAction";
import type { StaffShift } from "../../types/scheduling";
import { NavLink, Outlet } from "react-router-dom";
import { RoleSwitcher } from "../role/RoleSwitcher";
import { useFeatureFlags } from "../../services/configApi";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBell } from '../shared/NotificationBell';
import { SyncStatus } from '../shared/SyncStatus';
import { OfflineIndicator } from '../shared/OfflineIndicator';
import { OfflineToggle } from '../shared/OfflineToggle';
import WebSocketStatus from '../shared/WebSocketStatus';
import SecurityStatus from '../shared/SecurityStatus';
import { hasPermission, useResolvedPermissions } from "../../hooks/usePermissions";
import { useIsSupervisor } from "../../hooks/useIsSupervisor";
import { PermissionMatrix } from "../../hooks/usePermissions";
import { useState } from "react";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const { data: supervisorStatus } = useIsSupervisor();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const CAN_SEE_PHARMACY = hasPermission(permissions as PermissionMatrix, 'VIEW_PHARMACY');
  const CAN_MANAGE_PHARMACY_MEDICATIONS = hasPermission(permissions as PermissionMatrix , 'MANAGE_PHARMACY_MEDICATIONS');
  const CAN_MANAGE_PHARMACY_INVENTORY = hasPermission(permissions as PermissionMatrix, 'MANAGE_PHARMACY_INVENTORY');
  const CAN_MANAGE_PRESCRIPTIONS = hasPermission(permissions as PermissionMatrix, 'MANAGE_PRESCRIPTIONS');
  const CAN_SEE_BILLING = hasPermission(permissions as PermissionMatrix, 'VIEW_BILLING');
  const CAN_VIEW_REPORTS = hasPermission(permissions as PermissionMatrix, 'VIEW_REPORTS');

  const { data: flags } = useFeatureFlags();
  const isAdmin = user?.roles?.some((r: any) => (typeof r === 'string' ? (r === 'ADMIN' || r === 'ROLE_ADMIN') : (r.roleKey === 'ADMIN' || r.roleKey === 'ROLE_ADMIN')));
  const flagEnabled = (key: string) => flags?.some(f => f.flagKey === key && f.enabled);
  const shiftAction = useShiftAction();
  const handleCheckIn = (shift: StaffShift) => {
    shiftAction.mutate({ shift, status: "CHECKED_IN" });
  };
  const handleCheckOut = (shift: StaffShift) => {
    shiftAction.mutate({ shift, status: "COMPLETED" });
  };

  if (isAdmin) {
    return (
      <div className="app-shell min-vh-100 d-flex flex-column">
        <OfflineIndicator />
        <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
          <Container fluid>
            <Navbar.Brand className="fw-bold d-flex align-items-center">
              <i className="bi bi-hospital me-2 fs-4"></i>
              <span>AfyaQuik HMS</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="primary-nav" />
            <Navbar.Collapse id="primary-nav" className="justify-content-end">
              <div className="d-flex align-items-center gap-2">
                <RoleSwitcher />
                <SyncStatus />
                <WebSocketStatus />
                <SecurityStatus />
                <OfflineToggle />
                <NotificationBell />
                <Dropdown align="end">
                  <Dropdown.Toggle size="sm" variant="outline-light" className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-1"></i>
                    <span className="d-none d-sm-inline">{user?.displayName ?? user?.username ?? "Account"}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="text-start dropdown-menu-constrained">
                    <Dropdown.Header className="d-flex align-items-center">
                      <i className="bi bi-building me-2"></i>
                      {user?.tenantId ?? "Tenant"}
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={NavLink} to="/profile" className="d-flex align-items-center">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/time-off" className="d-flex align-items-center">
                      <i className="bi bi-calendar-x me-2"></i>
                      Time-Off Requests
                    </Dropdown.Item>
                    {supervisorStatus?.isSupervisor === true && (
                        <Dropdown.Item as={NavLink} to="/team" className="d-flex align-items-center">
                          <i className="bi bi-people-fill me-1"></i>
                          <span className="d-none d-md-inline">Team</span>
                        </Dropdown.Item>
                      )}
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
        <main className="flex-grow-1 bg-light">
          <Container fluid className="py-3">
            <ShiftAlertsBanner onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
            <Outlet />
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell min-vh-100 d-flex flex-column">
      <OfflineIndicator />
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-bold d-flex align-items-center">
            <i className="bi bi-hospital me-2 fs-4"></i>
            <span>AfyaQuik HMS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="primary-nav" />
          <Navbar.Collapse id="primary-nav" className="justify-content-end">
            <div className="d-flex align-items-center gap-2">
              <RoleSwitcher />
              <SyncStatus />
              <WebSocketStatus />
              <SecurityStatus />
              <OfflineToggle />
              <NotificationBell />
              <Dropdown align="end">
                <Dropdown.Toggle size="sm" variant="outline-light" className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{user?.displayName ?? user?.username ?? "Account"}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-start dropdown-menu-constrained">
                  <Dropdown.Header className="d-flex align-items-center">
                    <i className="bi bi-building me-2"></i>
                    {user?.tenantId ?? "Tenant"}
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={NavLink} to="/profile" className="d-flex align-items-center">
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={NavLink} to="/time-off" className="d-flex align-items-center">
                    <i className="bi bi-calendar-x me-2"></i>
                    Time-Off Requests
                  </Dropdown.Item>
                  {supervisorStatus?.isSupervisor === true && (
                      <Dropdown.Item as={NavLink} to="/team" className="d-flex align-items-center">
                        <i className="bi bi-people-fill me-1"></i>
                        <span className="d-none d-md-inline">Team</span>
                      </Dropdown.Item>
                    )}
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
      
      <div className="d-flex flex-grow-1" style={{minHeight:'calc(100vh - 56px)'}}>
        <aside className={`border-end bg-light transition-all ${sidebarCollapsed ? 'collapsed' : ''}`} style={{width: sidebarCollapsed ? 60 : 280}}>
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            {!sidebarCollapsed && (
              <>
                <div>
                  <h5 className="mb-0 text-primary">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </h5>
                  <small className="text-muted">Healthcare Management</small>
                </div>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </>
            )}
            {sidebarCollapsed && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            )}
          </div>
          
          <nav className="p-3">
            {/* Core Operations Section */}
            <div className="mb-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                <i className="bi bi-house-fill me-2"></i>
                {!sidebarCollapsed && "Core Operations"}
              </h6>
              <div className="d-flex flex-column gap-1">
                <NavLink to="/dashboard" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                  <i className="bi bi-speedometer2 me-2"></i>
                  {!sidebarCollapsed && "Dashboard"}
                </NavLink>
                <NavLink to="/queue" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                  <i className="bi bi-list-ul me-2"></i>
                  {!sidebarCollapsed && "Queue"}
                </NavLink>
                <NavLink to="/patients" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                  <i className="bi bi-people me-2"></i>
                  {!sidebarCollapsed && "Patients"}
                </NavLink>
              </div>
            </div>

            {/* Scheduling Section */}
            <div className="mb-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                <i className="bi bi-calendar3 me-2"></i>
                {!sidebarCollapsed && "Scheduling"}
              </h6>
              <div className="d-flex flex-column gap-1">
                <NavLink to="/scheduling" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                  <i className="bi bi-calendar3 me-2"></i>
                  {!sidebarCollapsed && "Scheduling"}
                </NavLink>
                <NavLink to="/appointments" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                  <i className="bi bi-calendar-check me-2"></i>
                  {!sidebarCollapsed && "Appointments"}
                </NavLink>
              </div>
            </div>

            {/* Pharmacy Section */}
            {CAN_SEE_PHARMACY && (
              <div className="mb-4">
                <h6 className="text-uppercase text-muted small fw-bold mb-3">
                  <i className="bi bi-capsule me-2"></i>
                  {!sidebarCollapsed && "Pharmacy"}
                </h6>
                <div className="d-flex flex-column gap-1">
                  {CAN_MANAGE_PHARMACY_MEDICATIONS && (
                    <NavLink to="/pharmacy/medications" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                      <i className="bi bi-capsule me-2"></i>
                      {!sidebarCollapsed && "Medications"}
                    </NavLink>
                  )}
                  {CAN_MANAGE_PHARMACY_INVENTORY && (
                    <NavLink to="/pharmacy/medication-inventory" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                      <i className="bi bi-box-seam me-2"></i>
                      {!sidebarCollapsed && "Inventory"}
                    </NavLink>
                  )}
                  {CAN_MANAGE_PRESCRIPTIONS && (
                    <NavLink to="/pharmacy/prescriptions" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                      <i className="bi bi-prescription me-2"></i>
                      {!sidebarCollapsed && "Prescriptions"}
                    </NavLink>
                  )}
                </div>
              </div>
            )}

            {/* Reports Section */}
            {CAN_VIEW_REPORTS && (
              <div className="mb-4">
                <h6 className="text-uppercase text-muted small fw-bold mb-3">
                  <i className="bi bi-graph-up me-2"></i>
                  {!sidebarCollapsed && "Reports"}
                </h6>
                <div className="d-flex flex-column gap-1">
                  <NavLink to="/reports" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                    <i className="bi bi-graph-up me-2"></i>
                    {!sidebarCollapsed && "Reports"}
                  </NavLink>
                </div>
              </div>
            )}

            {/* Admin Section */}
            {flagEnabled('admin-ui') && (
              <div className="mb-4">
                <h6 className="text-uppercase text-muted small fw-bold mb-3">
                  <i className="bi bi-gear me-2"></i>
                  {!sidebarCollapsed && "Administration"}
                </h6>
                <div className="d-flex flex-column gap-1">
                  <NavLink to="/admin" className={({isActive}) => `nav-link rounded d-flex align-items-center ${isActive?'active bg-primary text-white':''}`}>
                    <i className="bi bi-gear me-2"></i>
                    {!sidebarCollapsed && "Admin Panel"}
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
        </aside>
        
        <main className="flex-grow-1 bg-light">
          <Container fluid className="py-3">
            <ShiftAlertsBanner onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}
