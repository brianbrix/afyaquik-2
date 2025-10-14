package com.afyaquik.hms.billing.domain;

/**
 * Enum representing the status of a bill.
 */
public enum BillStatus {
    DRAFT("Draft"),
    SENT("Sent"),
    PAID("Paid"),
    PARTIALLY_PAID("Partially Paid"),
    OVERDUE("Overdue"),
    CANCELLED("Cancelled"),
    REFUNDED("Refunded");

    private final String displayName;

    BillStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
