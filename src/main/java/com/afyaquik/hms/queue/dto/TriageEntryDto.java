package com.afyaquik.hms.queue.dto;

import java.time.Instant;

public class TriageEntryDto {
    private Long id;
    private String title;
    private String details;
    private String createdBy;
    private Instant createdAt;

    public TriageEntryDto() {}

    public TriageEntryDto(Long id, String title, String details, String createdBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.details = details;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
