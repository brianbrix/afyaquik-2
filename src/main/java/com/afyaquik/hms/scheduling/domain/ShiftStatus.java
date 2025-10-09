package com.afyaquik.hms.scheduling.domain;

/**
 * Captures the lifecycle of a staff shift. The states are designed to support
 * reporting, queue availability checks, and swap workflows.
 */
public enum ShiftStatus {

	/** Shift has been created and is awaiting start. */
	SCHEDULED,

	/** Staff member has confirmed arrival for the shift. */
	CHECKED_IN,

	/** Shift is actively in progress. */
	IN_PROGRESS,

	/** Shift completed successfully. */
	COMPLETED,

	/** Shift has been cancelled before starting. */
	CANCELLED,

	/** Staff member requested a swap; pending approval/action. */
	SWAP_REQUESTED,

	/** Shift reassigned/swapped with another staff member. */
	SWAPPED
}
