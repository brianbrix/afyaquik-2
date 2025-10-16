import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { ShiftAlertsBanner } from "../scheduling/ShiftAlertsBanner";
import { useShiftAction } from "../../hooks/useShiftAction";
import type { StaffShift } from "../../types/scheduling";
import { NavLink, Outlet } from "react-router-dom";
import { RoleSwitcher } from "../role/RoleSwitcher";
import { useFeatureFlags } from "../../services/configApi";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBell } from '../shared/NotificationBell';
import { hasPermission, useResolvedPermissions } from "../../hooks/usePermissions";
import { useIsSupervisor } from "../../hooks/useIsSupervisor";
import { PermissionMatrix } from "../../hooks/usePermissions";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const { data: supervisorStatus } = useIsSupervisor();
  const CAN_SEE_PHARMACY = hasPermission(permissions as PermissionMatrix, 'VIEW_PHARMACY');
  const CAN_MANAGE_PHARMACY_MEDICATIONS = hasPermission(permissions as PermissionMatrix , 'MANAGE_PHARMACY_MEDICATIONS');
  const CAN_MANAGE_PHARMACY_INVENTORY = hasPermission(permissions as PermissionMatrix, 'MANAGE_PHARMACY_INVENTORY');
  const CAN_MANAGE_PRESCRIPTIONS = hasPermission(permissions as PermissionMatrix, 'MANAGE_PRESCRIPTIONS');
  const CAN_SEE_BILLING = hasPermission(permissions as PermissionMatrix, 'VIEW_BILLING');

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
  return (
    <div className="app-shell min-vh-100 d-flex flex-column">
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-bold d-flex align-items-center">
            <i className="bi bi-hospital me-2 fs-4"></i>
            <span>AfyaQuik HMS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="primary-nav" />
          <Navbar.Collapse id="primary-nav" className="justify-content-between">
            <Nav className="me-auto gap-1">
              {isAdmin
                ? (flagEnabled('admin-ui') && (
                    <Nav.Link as={NavLink} to="/admin" className="d-flex align-items-center">
                      <i className="bi bi-gear-fill me-1"></i>
                      Admin
                    </Nav.Link>
                  ))
                : <>
                    <Nav.Link as={NavLink} to="/dashboard" className="d-flex align-items-center">
                      <i className="bi bi-speedometer2 me-1"></i>
                      <span className="d-none d-md-inline">Dashboard</span>
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/queue" className="d-flex align-items-center">
                      <i className="bi bi-list-ul me-1"></i>
                      <span className="d-none d-md-inline">Queue</span>
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/patients" className="d-flex align-items-center">
                      <i className="bi bi-people me-1"></i>
                      <span className="d-none d-md-inline">Patients</span>
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/scheduling" className="d-flex align-items-center">
                      <i className="bi bi-calendar3 me-1"></i>
                      <span className="d-none d-md-inline">Scheduling</span>
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/reports" className="d-flex align-items-center">
                      <i className="bi bi-graph-up me-1"></i>
                      <span className="d-none d-md-inline">Reports</span>
                    </Nav.Link>
                    {CAN_SEE_PHARMACY && (
                    <Dropdown>
                      <Dropdown.Toggle as={Nav.Link} variant="link" className="text-white text-decoration-none d-flex align-items-center">
                        <i className="bi bi-capsule me-1"></i>
                        <span className="d-none d-md-inline">Pharmacy</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {CAN_MANAGE_PHARMACY_MEDICATIONS && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/medications" className="d-flex align-items-center">
                          <i className="bi bi-capsule me-2"></i>
                          Medications
                        </Dropdown.Item>
                        )}
                  
                        {CAN_MANAGE_PHARMACY_INVENTORY && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/medication-inventory" className="d-flex align-items-center">
                          <i className="bi bi-capsule me-2"></i>
                          Medication Inventory
                        </Dropdown.Item>
                        )}
                        {CAN_MANAGE_PRESCRIPTIONS && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/prescriptions" className="d-flex align-items-center">
                          <i className="bi bi-prescription me-2"></i>
                          Prescriptions
                        </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                    )}
                    {/* {CAN_SEE_BILLING && (
                    <Dropdown>
                      <Dropdown.Toggle as={Nav.Link} variant="link" className="text-white text-decoration-none d-flex align-items-center">
                        <i className="bi bi-currency-dollar me-1"></i>
                        <span className="d-none d-md-inline">Billing</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={NavLink} to="/billing/bills" className="d-flex align-items-center">
                          <i className="bi bi-receipt me-2"></i>
                          Bills
                        </Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="/billing/payments" className="d-flex align-items-center">
                          <i className="bi bi-credit-card me-2"></i>
                          Payments
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    )} */}
                    
                    {flagEnabled('admin-ui') && (
                      <Nav.Link as={NavLink} to="/admin" className="d-flex align-items-center">
                        <i className="bi bi-gear me-1"></i>
                        <span className="d-none d-md-inline">Admin</span>
                      </Nav.Link>
                    )}
                  </>
              }
            </Nav>
            <div className="d-flex align-items-center gap-2">
              <RoleSwitcher />
              <NotificationBell />
              <Dropdown align="end">
                <Dropdown.Toggle size="sm" variant="outline-light" className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{user?.displayName ?? user?.username ?? "Account"}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-start">
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
