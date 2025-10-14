package com.afyaquik.hms.diagnostics.domain;

public enum DiagnosticItemStatus {
    ORDERED("Ordered"),
    SAMPLE_COLLECTED("Sample Collected"),
    SAMPLE_RECEIVED("Sample Received"),
    IN_PROCESS("In Process"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    REJECTED("Rejected");
    
    private final String displayName;
    
    DiagnosticItemStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
