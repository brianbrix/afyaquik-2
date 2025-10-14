package com.afyaquik.hms.diagnostics.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItemStatus;
import com.afyaquik.hms.diagnostics.repository.DiagnosticItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DiagnosticItemService {
    
    private final DiagnosticItemRepository diagnosticItemRepository;
    
    public DiagnosticItemService(DiagnosticItemRepository diagnosticItemRepository) {
        this.diagnosticItemRepository = diagnosticItemRepository;
    }
    
    public void updateDiagnosticItemStatus(Long id, DiagnosticItemStatus status) {
        DiagnosticItem item = diagnosticItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Diagnostic item not found: " + id));
        
        item.setStatus(status);
        item.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        diagnosticItemRepository.save(item);
    }
}
