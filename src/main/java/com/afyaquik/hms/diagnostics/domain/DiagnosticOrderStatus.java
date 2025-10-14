package com.afyaquik.hms.diagnostics.domain;

public enum DiagnosticOrderStatus {
    ORDERED("Ordered"),
    IN_PROGRESS("In Progress"),
    SAMPLE_COLLECTED("Sample Collected"),
    SAMPLE_RECEIVED("Sample Received"),
    IN_PROCESS("In Process"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    REJECTED("Rejected");
    
    private final String displayName;
    
    DiagnosticOrderStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
