import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { apiClient } from "./apiClient";
import {
  fetchActiveRole,
  updateActiveRole,
  login,
  refreshAccessToken,
  fetchProfile
} from "./authApi";

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
});

afterEach(() => {
  mock.resetHistory();
});

describe("authApi", () => {
  it("logs in a user with tenant header", async () => {
    mock.onPost("/auth/login").reply((config) => {
      expect(config.headers?.["X-Tenant-Id"]).toBe("tenantA");
      expect(JSON.parse(config.data)).toEqual({ username: "demo", password: "pass" });
      return [200, { status: "OK", data: {
        accessToken: "access-token",
        accessTokenExpiresIn: 900,
        refreshToken: "refresh-token",
        refreshTokenExpiresIn: 604800,
        user: {
          id: 1,
          username: "demo",
          displayName: "Demo User",
          tenantId: "tenantA",
          roles: ["PROVIDER"]
        }
      }}];
    });

    const response = await login("tenantA", { username: "demo", password: "pass" });

    expect(response.accessToken).toBe("access-token");
    expect(response.user.username).toBe("demo");
  });

  it("refreshes access token", async () => {
    mock.onPost("/auth/refresh").reply((config) => {
      expect(config.headers?.["X-Tenant-Id"]).toBe("tenantA");
      expect(JSON.parse(config.data)).toEqual({ refreshToken: "refresh-token" });
  return [200, { status: "OK", data: { accessToken: "new-access", accessTokenExpiresIn: 900 } }];
    });

    const response = await refreshAccessToken("tenantA", "refresh-token");

    expect(response.accessToken).toBe("new-access");
  });

  it("fetches current profile", async () => {
    mock.onGet("/auth/me").reply(200, { status: "OK", data: {
      id: 1,
      username: "demo",
      displayName: "Demo User",
      tenantId: "tenantA",
  roles: ["PROVIDER"]
    }});

    const profile = await fetchProfile();

    expect(profile.username).toBe("demo");
  });

  it("fetches current active role", async () => {
  mock.onGet("/auth/active-role").reply(200, { role: "PROVIDER" });

    const role = await fetchActiveRole();

    expect(role).toBe("provider");
  });

  it("returns null when no active role is set", async () => {
    mock.onGet("/auth/active-role").reply(204);

    const role = await fetchActiveRole();

    expect(role).toBeNull();
  });

  it("persists selected active role", async () => {
  mock.onPost("/auth/active-role", { role: "TRIAGE" }).reply(200, { role: "TRIAGE" });

  const role = await updateActiveRole("TRIAGE");

  expect(role).toBe("TRIAGE");
  });
});
