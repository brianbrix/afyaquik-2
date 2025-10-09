package com.afyaquik.hms.scheduling.domain;

/**
 * Enumerates the supported shift templates available in the scheduling module.
 * These values are intentionally broad so tenants can map them to their
 * internal rota terminology while still driving analytics and filtering.
 */
public enum ShiftType {

	/** Morning duty, typically opening hours. */
	MORNING,

	/** Afternoon coverage or mid-day duty. */
	AFTERNOON,

	/** Evening service window (late clinic, urgent care, etc.). */
	EVENING,

	/** Overnight shift. */
	NIGHT,

	/** On-call coverage, may span longer durations. */
	ON_CALL,

	/**
	 * Flexible or ad-hoc assignment. Used when a shift does not match the
	 * predefined templates but must still be tracked.
	 */
	FLEX
}
