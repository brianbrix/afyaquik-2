import { useEffect, useMemo, useState } from "react";
import { fetchRoleRedirects, RoleRedirectUrl } from "../../../services/roleRedirectApi";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner, InputGroup } from "react-bootstrap";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_TENANT_ID } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuth";
import { useSystemSettings } from "../../../hooks/useSystemSettings";
import { useTenantTheme } from "../../../services/configApi";
// Using Bootstrap icons instead of react-icons for better compatibility
import Swal from "sweetalert2";

export function LoginPage() {
  const { login, authError, clearError, isAuthenticating, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency, formatDate } = useSystemSettings();
  const { data: theme } = useTenantTheme();
  
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname: string } } | undefined;
    return state?.from?.pathname ?? "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (authError) {
      setLoginAttempts(prev => prev + 1);
      const timeout = window.setTimeout(() => clearError(), 5000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [authError, clearError]);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedCredentials = localStorage.getItem('afyaquik.hms.remembered');
    if (savedCredentials) {
      try {
        const { tenantId: savedTenant, username: savedUsername, rememberMe: wasRemembered } = JSON.parse(savedCredentials);
        if (wasRemembered) {
          setTenantId(savedTenant);
          setUsername(savedUsername);
          setRememberMe(true);
        }
      } catch (error) {
        console.warn('Failed to load saved credentials:', error);
      }
    }
  }, []);

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
    
    // Show loading state with better UX
    if (loginAttempts > 2) {
      await Swal.fire({
        title: 'Multiple Failed Attempts',
        text: 'Please wait a moment before trying again.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    try {
      const loginResult = await login(tenantId.trim(), { username: username.trim(), password });
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('afyaquik.hms.remembered', JSON.stringify({
          tenantId: tenantId.trim(),
          username: username.trim(),
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('afyaquik.hms.remembered');
      }

      // Show success message
      await Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back to AfyaQuik HMS',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      // Determine redirect path based on role and backend config
      let finalRedirect = redirectPath;
      if (loginResult && loginResult.roleRedirects) {
        // Get user roles from session storage (set by AuthProvider)
        const sessionRaw = window.localStorage.getItem("afyaquik.hms.session");
        let userRoles: string[] = [];
        if (sessionRaw) {
          try {
            const session = JSON.parse(sessionRaw);
            userRoles = session.user?.roles ?? [];
          } catch {}
        }
        // Find the first matching role with a redirect URL
        const match = loginResult.roleRedirects.find(r => userRoles.includes(r.roleKey));
        if (match && match.redirectUrl) {
          finalRedirect = match.redirectUrl;
        }
      }
      navigate(finalRedirect, { replace: true });
    } catch (error) {
      // error handled in provider
    }
  };

  const isSubmitDisabled = !tenantId || !username || !password || isAuthenticating;

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .login-background {
            background: linear-gradient(135deg, 
              rgb(10, 111, 253) 0%, 
              rgb(10, 111, 253) 25%, 
              rgba(10, 111, 253, 0.8) 50%, 
              rgba(10, 111, 253, 0.6) 75%, 
              rgba(10, 111, 253, 0.4) 100%);
            position: relative;
            overflow: hidden;
          }
          
          .login-background::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          .login-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            animation: fadeInUp 0.8s ease-out;
          }
          
          .login-button {
            background: rgb(10, 111, 253) !important;
            border-color: rgb(10, 111, 253) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          
          .login-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .login-button:hover {
            background: rgb(10, 111, 253) !important;
            border-color: rgb(10, 111, 253) !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(10, 111, 253, 0.4);
          }
          
          .login-button:hover::before {
            left: 100%;
          }
          
          .login-button:active {
            transform: translateY(-1px);
          }
          
          .form-control {
            border: 2px solid rgba(10, 111, 253, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
          }
          
          .form-control:focus {
            border-color: rgb(10, 111, 253) !important;
            box-shadow: 0 0 0 0.2rem rgba(10, 111, 253, 0.15) !important;
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
          }
          
          .login-icon {
            color: rgb(10, 111, 253);
            transition: all 0.3s ease;
          }
          
          .login-header {
            background: linear-gradient(135deg, rgb(10, 111, 253) 0%, rgb(10, 111, 253) 100%);
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .login-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .form-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            transition: color 0.3s ease;
          }
          
          .form-label:hover {
            color: rgb(10, 111, 253);
          }
          
          .remember-me {
            color: #6b7280;
            font-size: 0.9rem;
          }
          
          .forgot-password {
            color: rgb(10, 111, 253);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }
          
          .forgot-password:hover {
            color: rgb(10, 111, 253);
            text-decoration: underline;
          }
          
          .login-title {
            font-weight: 700;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .login-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            margin-bottom: 0;
          }
        `}
      </style>
      <div 
        className="min-vh-100 d-flex align-items-center login-background"
      >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 login-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              {/* Header with Logo */}
              <div 
                className="text-center py-5 login-header position-relative"
              >
                {theme?.logoUrl ? (
                  <img 
                    src={theme.logoUrl} 
                    alt="AfyaQuik HMS" 
                    style={{ height: '80px', marginBottom: '16px' }}
                    className="position-relative"
                  />
                ) : (
                  <div className="mb-4 position-relative">
                    <i className="bi bi-heart-pulse" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                  </div>
                )}
                <h1 className="login-title mb-2">Welcome Back</h1>
                <p className="login-subtitle mb-0">Sign in to continue to AfyaQuik HMS</p>
              </div>

              <Card.Body className="p-5">
                {authError && (
                  <Alert 
                    variant="danger" 
                    onClose={() => clearError()} 
                    dismissible
                    className="mb-4"
                    style={{ borderRadius: '10px' }}
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <div>
                        <strong>Login Failed</strong>
                        <br />
                        <small>{authError}</small>
                        {loginAttempts > 0 && (
                          <small className="d-block mt-1 text-muted">
                            Attempt {loginAttempts} of 3
                          </small>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                  {/* Tenant ID Field */}
                  <Form.Group controlId="tenant">
                    <Form.Label className="form-label">
                      <i className="bi bi-building me-2 login-icon"></i>
                      Tenant ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={tenantId}
                      autoComplete="organization"
                      onChange={(event) => setTenantId(event.target.value)}
                      placeholder="Enter your tenant ID"
                      className="py-3"
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      required
                    />
                  </Form.Group>

                  {/* Username Field */}
                  <Form.Group controlId="username">
                    <Form.Label className="form-label">
                      <i className="bi bi-person me-2 login-icon"></i>
                      Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      autoComplete="username"
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter your username"
                      className="py-3"
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      required
                    />
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group controlId="password">
                    <Form.Label className="form-label">
                      <i className="bi bi-lock me-2 login-icon"></i>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="py-3"
                        style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderRadius: '0 10px 10px 0', border: '2px solid #e9ecef', borderLeft: 'none' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Remember Me Checkbox */}
                  <Form.Group className="d-flex justify-content-between align-items-center">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-me"
                    />
                    <Button
                      variant="link"
                      className="p-0 forgot-password"
                      onClick={() => {
                        Swal.fire({
                          title: 'Forgot Password?',
                          text: 'Please contact your system administrator to reset your password.',
                          icon: 'info',
                          confirmButtonText: 'OK'
                        });
                      }}
                    >
                      Forgot password?
                    </Button>
                  </Form.Group>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100 py-3 fw-bold login-button"
                    disabled={isSubmitDisabled}
                    style={{ 
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  >
                    {isAuthenticating ? (
                      <>
                        <i className="bi bi-arrow-clockwise me-2" style={{ animation: 'spin 1s linear infinite' }}></i>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                {/* Footer */}
                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <small className="text-muted d-flex justify-content-center align-items-center gap-3">
                    <span>
                      <i className="bi bi-clock me-1"></i>
                      {formatDate(new Date())}
                    </span>
                    <span>•</span>
                    <span>
                      <i className="bi bi-currency-dollar me-1"></i>
                      {formatCurrency(0).replace('0.00', 'USD')}
                    </span>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>
    </>
  );
}
