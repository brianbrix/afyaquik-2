package com.afyaquik.hms.queue.dto;

import java.util.List;

public class BulkTriageEntryRequest {
    private List<BulkTriageEntryDto> entries;
    private List<Long> ids;

    public List<BulkTriageEntryDto> getEntries() { return entries; }
    public void setEntries(List<BulkTriageEntryDto> entries) { this.entries = entries; }

    public List<Long> getIds() { return ids; }
    public void setIds(List<Long> ids) { this.ids = ids; }

    public static class BulkTriageEntryDto {
        private Long id;
        private String title;
        private String details;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
    }
}
