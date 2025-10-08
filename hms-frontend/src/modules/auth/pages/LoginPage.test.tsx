import { describe, expect, it, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const loginMock = vi.fn();
const clearErrorMock = vi.fn();
const navigateMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: () => useAuthMock()
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockReset();
    clearErrorMock.mockReset();
    navigateMock.mockReset();
    useAuthMock.mockReset();
    loginMock.mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      login: loginMock,
      authError: null,
      clearError: clearErrorMock,
      isAuthenticating: false,
      isAuthenticated: false,
      isInitializing: false
    });
  });

  it("submits credentials and navigates after login", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/tenant id/i), { target: { value: "tenantA" } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "reception " } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("tenantA", { username: "reception", password: "password" });
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("disables submit while authenticating", () => {
    useAuthMock.mockReturnValue({
      login: loginMock,
      authError: null,
      clearError: clearErrorMock,
      isAuthenticating: true,
      isAuthenticated: false,
      isInitializing: false
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

  const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton.hasAttribute("disabled")).toBe(true);
  });
});
