package com.afyaquik.hms.diagnostics.domain;

public enum TestType {
    LABORATORY("Laboratory"),
    RADIOLOGY("Radiology"),
    PATHOLOGY("Pathology"),
    CARDIOLOGY("Cardiology"),
    PULMONOLOGY("Pulmonology"),
    NEUROLOGY("Neurology"),
    OTHER("Other");
    
    private final String displayName;
    
    TestType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
