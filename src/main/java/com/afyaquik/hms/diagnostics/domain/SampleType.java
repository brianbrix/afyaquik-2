package com.afyaquik.hms.diagnostics.domain;

public enum SampleType {
    BLOOD("Blood"),
    URINE("Urine"),
    STOOL("Stool"),
    SPUTUM("Sputum"),
    SWAB("Swab"),
    TISSUE("Tissue"),
    FLUID("Fluid"),
    OTHER("Other");
    
    private final String displayName;
    
    SampleType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
