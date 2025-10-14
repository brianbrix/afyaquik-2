package com.afyaquik.hms.queue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TriageEntryRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String details;
    @NotNull
    private Long queueItemId;
    private String createdBy;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Long getQueueItemId() { return queueItemId; }
    public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
