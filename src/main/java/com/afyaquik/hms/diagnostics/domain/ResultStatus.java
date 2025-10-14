package com.afyaquik.hms.diagnostics.domain;

public enum ResultStatus {
    PENDING("Pending"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    VALIDATED("Validated"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");
    
    private final String displayName;
    
    ResultStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
