package com.afyaquik.hms.diagnostics.dto;

import com.afyaquik.hms.diagnostics.domain.AttachmentType;

public class ResultAttachmentDto {
    private Long id;
    private Long diagnosticResultId;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;
    private AttachmentType attachmentType;
    private String description;
    private String uploadedBy;
    private String uploadedByName;
    
    // Constructors
    public ResultAttachmentDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDiagnosticResultId() { return diagnosticResultId; }
    public void setDiagnosticResultId(Long diagnosticResultId) { this.diagnosticResultId = diagnosticResultId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public AttachmentType getAttachmentType() { return attachmentType; }
    public void setAttachmentType(AttachmentType attachmentType) { this.attachmentType = attachmentType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
}
