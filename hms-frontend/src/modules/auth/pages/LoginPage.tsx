import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_TENANT_ID } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuth";

export function LoginPage() {
  const { login, authError, clearError, isAuthenticating, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname: string } } | undefined;
    return state?.from?.pathname ?? "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (authError) {
      const timeout = window.setTimeout(() => clearError(), 5000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [authError, clearError]);

  if (isInitializing) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(tenantId.trim(), { username: username.trim(), password });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // error handled in provider
    }
  };

  const isSubmitDisabled = !tenantId || !username || !password || isAuthenticating;

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-4 text-center">
                  <h1 className="h4 mb-1">Sign in to AfyaQuik HMS</h1>
                  <p className="text-muted mb-0">Enter your tenant, username, and password to continue.</p>
                </div>
                {authError && (
                  <Alert variant="danger" onClose={() => clearError()} dismissible>
                    {authError}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <Form.Group controlId="tenant">
                    <Form.Label>Tenant ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={tenantId}
                      autoComplete="organization"
                      onChange={(event) => setTenantId(event.target.value)}
                      placeholder="e.g. tenantA"
                    />
                  </Form.Group>
                  <Form.Group controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      autoComplete="username"
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="e.g. reception"
                    />
                  </Form.Group>
                  <Form.Group controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      autoComplete="current-password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100" disabled={isSubmitDisabled}>
                    {isAuthenticating ? "Signing in..." : "Sign in"}
                  </Button>
                </Form>
                <p className="text-muted mt-4 mb-0 small">
                  Tip: use tenant <code>tenantA</code> and username <code>reception</code> to log in with seeded data.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
