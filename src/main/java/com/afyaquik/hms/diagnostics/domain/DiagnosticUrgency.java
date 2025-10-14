package com.afyaquik.hms.diagnostics.domain;

public enum DiagnosticUrgency {
    ROUTINE("Routine"),
    STAT("Stat"),
    EMERGENCY("Emergency");
    
    private final String displayName;
    
    DiagnosticUrgency(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
