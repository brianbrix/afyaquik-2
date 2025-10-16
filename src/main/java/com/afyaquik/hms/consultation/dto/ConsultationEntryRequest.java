package com.afyaquik.hms.consultation.dto;

public class ConsultationEntryRequest {
    private String title;
    private String details;
    private Long consultationTitleId;
    private Integer sortOrder;
    
    public ConsultationEntryRequest() {}
    
    public ConsultationEntryRequest(String title, String details) {
        this.title = title;
        this.details = details;
    }
    
    public ConsultationEntryRequest(String title, String details, Long consultationTitleId, Integer sortOrder) {
        this.title = title;
        this.details = details;
        this.consultationTitleId = consultationTitleId;
        this.sortOrder = sortOrder;
    }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    
    public Long getConsultationTitleId() { return consultationTitleId; }
    public void setConsultationTitleId(Long consultationTitleId) { this.consultationTitleId = consultationTitleId; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
