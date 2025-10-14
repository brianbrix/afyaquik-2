package com.afyaquik.hms.diagnostics.domain;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "result_attachments")
public class ResultAttachment extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_result_id", nullable = false)
    private DiagnosticResult diagnosticResult;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String originalFileName;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String mimeType;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentType attachmentType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String uploadedBy;
    
    @Column(nullable = false)
    private String uploadedByName;
    
    // Constructors
    public ResultAttachment() {}
    
    public ResultAttachment(DiagnosticResult diagnosticResult, String fileName, String originalFileName, 
                           String filePath, String mimeType, Long fileSize, AttachmentType attachmentType,
                           String uploadedBy, String uploadedByName) {
        this.diagnosticResult = diagnosticResult;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.attachmentType = attachmentType;
        this.uploadedBy = uploadedBy;
        this.uploadedByName = uploadedByName;
    }
    
    // Getters and Setters
    public DiagnosticResult getDiagnosticResult() { return diagnosticResult; }
    public void setDiagnosticResult(DiagnosticResult diagnosticResult) { this.diagnosticResult = diagnosticResult; }
    
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
