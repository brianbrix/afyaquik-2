package com.afyaquik.hms.diagnostics.dto;

public class DiagnosticItemRequest {
    private Long testCatalogId;
    private String notes;
    
    // Constructors
    public DiagnosticItemRequest() {}
    
    public DiagnosticItemRequest(Long testCatalogId, String notes) {
        this.testCatalogId = testCatalogId;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getTestCatalogId() { return testCatalogId; }
    public void setTestCatalogId(Long testCatalogId) { this.testCatalogId = testCatalogId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
