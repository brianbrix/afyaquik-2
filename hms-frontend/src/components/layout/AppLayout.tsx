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

export function AppLayout() {
  const { user, logout } = useAuth();
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const CAN_SEE_PHARMACY = hasPermission(permissions, 'VIEW_PHARMACY');
  const CAN_MANAGE_PHARMACY_MEDICATIONS = hasPermission(permissions, 'MANAGE_PHARMACY_MEDICATIONS');
  const CAN_MANAGE_PHARMACY_INVENTORY = hasPermission(permissions, 'MANAGE_PHARMACY_INVENTORY');
  const CAN_MANAGE_PRESCRIPTIONS = hasPermission(permissions, 'MANAGE_PRESCRIPTIONS');

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
          <Navbar.Brand className="fw-semibold">AfyaQuik HMS</Navbar.Brand>
          <Navbar.Toggle aria-controls="primary-nav" />
          <Navbar.Collapse id="primary-nav" className="justify-content-between">
            <Nav className="me-auto gap-2">
              {isAdmin
                ? (flagEnabled('admin-ui') && <Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>)
                : <>
                    <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={NavLink} to="/queue">Queue</Nav.Link>
                    <Nav.Link as={NavLink} to="/patients">Patients</Nav.Link>
                    <Nav.Link as={NavLink} to="/scheduling">Scheduling</Nav.Link>
                    <Nav.Link as={NavLink} to="/reports">Reports</Nav.Link>
                    {CAN_SEE_PHARMACY && (
                    <Dropdown>
                      <Dropdown.Toggle as={Nav.Link} variant="link" className="text-white text-decoration-none">
                        Pharmacy
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {CAN_MANAGE_PHARMACY_MEDICATIONS && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/medications">Medications</Dropdown.Item>
                        )}
                        {CAN_MANAGE_PHARMACY_INVENTORY && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/inventory">Inventory</Dropdown.Item>
                        )}
                        {CAN_MANAGE_PRESCRIPTIONS && (
                        <Dropdown.Item as={NavLink} to="/pharmacy/prescriptions">Prescriptions</Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                  
                    </Dropdown>
                    )}
                    <Dropdown>
                      <Dropdown.Toggle as={Nav.Link} variant="link" className="text-white text-decoration-none">
                        Billing
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={NavLink} to="/billing/bills">Bills</Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="/billing/payments">Payments</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {flagEnabled('admin-ui') && <Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>}
                  </>
              }
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <RoleSwitcher />
              <NotificationBell />
              <Dropdown align="end">
                <Dropdown.Toggle size="sm" variant="outline-light">
                  {user?.displayName ?? user?.username ?? "Account"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-start">
                  <Dropdown.Header>{user?.tenantId ?? "Tenant"}</Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={NavLink} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="flex-grow-1 bg-light">
        <Container fluid className="py-4">
          <ShiftAlertsBanner onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
