package com.afyaquik.hms.diagnostics.controller;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItemStatus;
import com.afyaquik.hms.diagnostics.service.DiagnosticItemService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/diagnostics")
public class DiagnosticItemController {
    
    private final DiagnosticItemService diagnosticItemService;
    
    public DiagnosticItemController(DiagnosticItemService diagnosticItemService) {
        this.diagnosticItemService = diagnosticItemService;
    }
    
    @PatchMapping("/items/{id}/status")
    public ApiResponse<Void> updateDiagnosticItemStatus(@PathVariable Long id,
                                                      @RequestParam DiagnosticItemStatus status) {
        diagnosticItemService.updateDiagnosticItemStatus(id, status);
        return ApiResponse.success(null);
    }
}
