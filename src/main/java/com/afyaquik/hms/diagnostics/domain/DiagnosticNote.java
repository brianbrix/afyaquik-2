package com.afyaquik.hms.diagnostics.domain;

import java.time.OffsetDateTime;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.domain.TenantAwareEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "diagnostic_notes")
@Data
@EqualsAndHashCode(callSuper = true)
public class DiagnosticNote extends BaseEntity implements TenantAwareEntity {

    @Column(name = "diagnostic_item_id", nullable = false)
    private Long diagnosticItemId;

    @Column(name = "note_text", columnDefinition = "TEXT", nullable = false)
    private String noteText;

    @Column(name = "added_by", nullable = false)
    private String addedBy;

    @Column(name = "added_by_name", nullable = false)
    private String addedByName;

    @Column(name = "added_at", nullable = false)
    private OffsetDateTime addedAt;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (addedAt == null) {
            addedAt = OffsetDateTime.now();
        }
    }
}
