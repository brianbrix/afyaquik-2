package com.afyaquik.hms.diagnostics.dto;

import java.time.Instant;
import lombok.Data;

@Data
public class DiagnosticFileAttachmentDto {
    private Long id;
    private Long diagnosticItemId;
    private String originalFilename;
    private String objectName;
    private Long fileSize;
    private String contentType;
    private String fileUrl;
    private String uploadedBy;
    private String uploadedByName;
    private Instant uploadedAt;
}
