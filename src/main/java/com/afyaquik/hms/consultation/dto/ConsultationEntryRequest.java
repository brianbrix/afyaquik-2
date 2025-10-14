package com.afyaquik.hms.consultation.dto;

public class ConsultationEntryRequest {
    private String title;
    private String details;
    public ConsultationEntryRequest() {}
    public ConsultationEntryRequest(String title, String details) {
        this.title = title;
        this.details = details;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
