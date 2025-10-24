package com.afyaquik.hms.audit.dto;

import java.util.List;

/**
 * Request DTO for offline audit sync
 */
public class OfflineAuditSyncRequest {
    
    private List<OfflineAuditEntryDto> entries;
    
    public OfflineAuditSyncRequest() {}
    
    public OfflineAuditSyncRequest(List<OfflineAuditEntryDto> entries) {
        this.entries = entries;
    }
    
    public List<OfflineAuditEntryDto> getEntries() {
        return entries;
    }
    
    public void setEntries(List<OfflineAuditEntryDto> entries) {
        this.entries = entries;
    }
}
