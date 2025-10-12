import { describe, expect, it, beforeEach, vi } from "vitest";
import { apiClient } from "./apiClient";
import {
	approveShiftSwap,
	createStaffShift,
	fetchStaffShifts,
	requestShiftSwap,
	updateStaffShift
} from "./schedulingApi";

vi.mock("./apiClient", () => {
	return {
		apiClient: {
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn()
		}
	};
});

describe("schedulingApi", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("fetches staff shifts with filters", async () => {
		const mockResponse = { data: [] };
		(apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const result = await fetchStaffShifts({ status: "SCHEDULED", departmentId: "OPD" });

		expect(apiClient.get).toHaveBeenCalledWith("/scheduling/shifts", {
			params: {
				staffUserId: undefined,
				status: "SCHEDULED",
				roleKey: undefined,
				departmentId: "OPD",
				rangeStart: undefined,
				rangeEnd: undefined
			}
		});
		expect(result).toEqual([]);
	});

	it("creates a staff shift", async () => {
		const payload = {
			staffUserId: 5,
			roleKey: "PROVIDER",
			departmentId: "OPD",
			shiftType: "MORNING" as const,
			startsAt: "2025-10-09T08:00:00Z",
			endsAt: "2025-10-09T14:00:00Z",
			notes: "Coverage"
		};
		const mockResponse = { data: { id: 1, ...payload, status: "SCHEDULED" as const, handoverNotes: null, staffDisplayName: "Dr. Alice" } };
		(apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const result = await createStaffShift(payload);

		expect(apiClient.post).toHaveBeenCalledWith("/scheduling/shifts", payload);
		expect(result).toEqual(mockResponse.data);
	});

	it("updates a staff shift", async () => {
		const mockResponse = { data: { id: 4 } };
		(apiClient.put as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const result = await updateStaffShift(4, { status: "CHECKED_IN" });

		expect(apiClient.put).toHaveBeenCalledWith("/scheduling/shifts/4", { status: "CHECKED_IN" });
		expect(result).toEqual(mockResponse.data);
	});

	it("requests a shift swap", async () => {
		const mockResponse = { data: { id: 7 } };
		(apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const result = await requestShiftSwap(7, { note: "Need cover" });

		expect(apiClient.post).toHaveBeenCalledWith(
			"/scheduling/shifts/7/swap-request",
			{ note: "Need cover" }
		);
		expect(result).toEqual(mockResponse.data);
	});

	it("approves a shift swap", async () => {
		const mockResponse = { data: { id: 10 } };
		(apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const payload = {
			targetStaffUserId: 99,
			note: "Covering",
			handoverNotes: "Keys"
		};

		const result = await approveShiftSwap(10, payload);

		expect(apiClient.post).toHaveBeenCalledWith(
			"/scheduling/shifts/10/swap-approve",
			payload
		);
		expect(result).toEqual(mockResponse.data);
	});
});
