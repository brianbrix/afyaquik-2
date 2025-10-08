import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import { RoleSwitcher } from "../role/RoleSwitcher";
import { useAuth } from "../../hooks/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell min-vh-100 d-flex flex-column">
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-semibold">AfyaQuik HMS</Navbar.Brand>
          <Navbar.Toggle aria-controls="primary-nav" />
          <Navbar.Collapse id="primary-nav" className="justify-content-between">
            <Nav className="me-auto gap-2">
              <Nav.Link as={NavLink} to="/dashboard">
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/queue">
                Queue
              </Nav.Link>
              <Nav.Link as={NavLink} to="/patients">
                Patients
              </Nav.Link>
              <Nav.Link as={NavLink} to="/scheduling">
                Scheduling
              </Nav.Link>
              <Nav.Link as={NavLink} to="/reports">
                Reports
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <RoleSwitcher />
              <Dropdown align="end">
                <Dropdown.Toggle size="sm" variant="outline-light">
                  {user?.displayName ?? user?.username ?? "Account"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-start">
                  <Dropdown.Header>{user?.tenantId ?? "Tenant"}</Dropdown.Header>
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
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
