package com.afyaquik.hms.diagnostics.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.diagnostics.domain.DiagnosticFileAttachment;

@Repository
public interface DiagnosticFileAttachmentRepository extends TenantAwareRepository<DiagnosticFileAttachment, Long> {
    
    List<DiagnosticFileAttachment> findByDiagnosticItemIdAndDeletedFalseOrderByUploadedAtDesc(Long diagnosticItemId);
    
    List<DiagnosticFileAttachment> findByDiagnosticItemIdInAndDeletedFalseOrderByUploadedAtDesc(List<Long> diagnosticItemIds);
}
