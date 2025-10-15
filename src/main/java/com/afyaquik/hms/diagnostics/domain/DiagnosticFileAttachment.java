package com.afyaquik.hms.diagnostics.domain;

import java.time.Instant;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.domain.TenantAwareEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "diagnostic_file_attachments")
@Data
@EqualsAndHashCode(callSuper = true)
public class DiagnosticFileAttachment extends BaseEntity implements TenantAwareEntity {

    @Column(name = "diagnostic_item_id", nullable = false)
    private Long diagnosticItemId;

    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    @Column(name = "object_name", nullable = false)
    private String objectName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_url", length = 1000, nullable = false)
    private String fileUrl;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "uploaded_by_name", nullable = false)
    private String uploadedByName;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Override
    protected void onCreate() {
        super.onCreate();
        if (uploadedAt == null) {
            uploadedAt = Instant.now();
        }
    }
}
