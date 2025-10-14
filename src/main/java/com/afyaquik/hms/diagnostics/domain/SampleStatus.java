package com.afyaquik.hms.diagnostics.domain;

public enum SampleStatus {
    PENDING("Pending"),
    COLLECTED("Collected"),
    RECEIVED("Received"),
    IN_PROCESS("In Process"),
    COMPLETED("Completed"),
    REJECTED("Rejected"),
    EXPIRED("Expired");
    
    private final String displayName;
    
    SampleStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
