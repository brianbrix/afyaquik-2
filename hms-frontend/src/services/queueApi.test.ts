import MockAdapter from "axios-mock-adapter";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { apiClient, DEFAULT_TENANT_ID } from "./apiClient";
import {
  assignQueueItem,
  fetchQueueByStatus,
  fetchQueueTimeline,
  transitionQueueItem
} from "./queueApi";
import type { QueueStatus } from "../types/queue";

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
});

afterEach(() => {
  mock.resetHistory();
});

describe("queueApi", () => {
  it("fetches queue items by status and sends tenant header", async () => {
    const sampleResponse = [
      {
        id: 1,
        ticketNumber: "TEN-001",
        patientName: "Jane Doe",
        visitReason: "Consultation",
        status: "PENDING_CHECKIN",
        priority: "MEDIUM",
        currentAssigneeId: null,
        departmentId: "OPD",
        createdAt: new Date().toISOString(),
        slaDueAt: null
      }
    ];

    mock.onGet("/queue").reply((config) => {
      const headers = config.headers as any;
      const tenantHeader =
        typeof headers?.get === "function" ? headers.get("X-Tenant-Id") : headers?.["X-Tenant-Id"];
      expect(config.params).toEqual({ status: "PENDING_CHECKIN" });
      expect(tenantHeader).toBe(DEFAULT_TENANT_ID);
      return [200, sampleResponse];
    });

    const result = await fetchQueueByStatus("PENDING_CHECKIN");
    expect(result).toEqual(sampleResponse);
  });

  it("assigns a queue item", async () => {
    const payload = {
      assigneeId: "nurse-1",
      assigneeDisplayName: "Nurse One",
  assigneeRole: "TRIAGE",
      departmentId: "TRIAGE",
      note: "Taking over"
    };

    const sampleResponse = {
      id: 42,
      patientId: 7,
      ticketNumber: "TEN-002",
      visitReason: "Follow-up",
      status: "WAITING_TRIAGE",
      previousStatus: "PENDING_CHECKIN",
      priority: "HIGH",
      currentAssigneeId: "nurse-1",
      departmentId: "TRIAGE",
      createdAt: new Date().toISOString(),
      slaDueAt: new Date().toISOString()
    };

    mock.onPost("/queue/42/assign").reply((config) => {
      expect(JSON.parse(config.data)).toEqual(payload);
      return [200, sampleResponse];
    });

    const result = await assignQueueItem(42, payload);
    expect(result).toEqual(sampleResponse);
  });

  it("transitions a queue item", async () => {
    const payload = {
      targetStatus: "IN_CONSULT" as QueueStatus,
      actorId: "provider-1",
  actorRole: "PROVIDER",
      actorDisplayName: "Dr. Smith",
      note: "Calling patient"
    };

    const sampleResponse = {
      id: 42,
      patientId: 7,
      ticketNumber: "TEN-002",
      visitReason: "Follow-up",
      status: "IN_CONSULT",
      previousStatus: "WAITING_PROVIDER",
      priority: "HIGH",
      currentAssigneeId: "provider-1",
      departmentId: "CONSULT",
      createdAt: new Date().toISOString(),
      slaDueAt: new Date().toISOString()
    };

    mock.onPost("/queue/42/transition").reply((config) => {
      expect(JSON.parse(config.data)).toEqual(payload);
      return [200, sampleResponse];
    });

    const result = await transitionQueueItem(42, payload);
    expect(result).toEqual(sampleResponse);
  });

  it("fetches timeline entries", async () => {
    const sampleResponse = [
      {
        id: 99,
        eventType: "CHECKED_IN",
        fromStatus: null,
        toStatus: "PENDING_CHECKIN",
        actorId: "reception-1",
  actorRole: "RECEPTION",
        actorDisplayName: "Reception Team",
        note: "Patient arrived",
        departmentId: "REG",
        createdAt: new Date().toISOString()
      }
    ];

    mock.onGet("/queue/42/timeline").reply(200, sampleResponse);

    const result = await fetchQueueTimeline(42);
    expect(result).toEqual(sampleResponse);
  });
});
