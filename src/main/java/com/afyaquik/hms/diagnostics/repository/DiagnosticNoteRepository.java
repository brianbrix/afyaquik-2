package com.afyaquik.hms.diagnostics.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.diagnostics.domain.DiagnosticNote;

@Repository
public interface DiagnosticNoteRepository extends TenantAwareRepository<DiagnosticNote, Long> {
    
    List<DiagnosticNote> findByDiagnosticItemIdAndDeletedFalseOrderByAddedAtDesc(Long diagnosticItemId);
    
    List<DiagnosticNote> findByDiagnosticItemIdInAndDeletedFalseOrderByAddedAtDesc(List<Long> diagnosticItemIds);
}
