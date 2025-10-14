package com.afyaquik.hms.diagnostics.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.dto.DiagnosticResultDto;
import com.afyaquik.hms.diagnostics.service.DiagnosticResultService;

@RestController
@RequestMapping("/api/v1/diagnostics/results")
public class DiagnosticResultController {
    
    private final DiagnosticResultService diagnosticResultService;
    
    public DiagnosticResultController(DiagnosticResultService diagnosticResultService) {
        this.diagnosticResultService = diagnosticResultService;
    }
    
    @GetMapping
    public ApiResponse<List<DiagnosticResultDto>> getAllDiagnosticResults(
            @RequestParam(required = false) Long diagnosticOrderId,
            @RequestParam(required = false) Long diagnosticItemId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long queueItemId,
            @RequestParam(required = false) String status) {
        
        List<DiagnosticResultDto> results;
        
        if (diagnosticOrderId != null) {
            results = diagnosticResultService.getDiagnosticResultsByOrder(diagnosticOrderId);
        } else if (diagnosticItemId != null) {
            results = diagnosticResultService.getDiagnosticResultsByItem(diagnosticItemId);
        } else if (patientId != null) {
            results = diagnosticResultService.getDiagnosticResultsByPatient(patientId);
        } else if (queueItemId != null) {
            results = diagnosticResultService.getDiagnosticResultsByQueueItem(queueItemId);
        } else if (status != null && !status.trim().isEmpty()) {
            results = diagnosticResultService.getDiagnosticResultsByStatus(status);
        } else {
            results = diagnosticResultService.getAllDiagnosticResults();
        }
        
        return ApiResponse.success(results);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<DiagnosticResultDto> getDiagnosticResultById(@PathVariable Long id) {
        Optional<DiagnosticResultDto> result = diagnosticResultService.getDiagnosticResultById(id);
        if (result.isPresent()) {
            return ApiResponse.success(result.get());
        } else {
            return ApiResponse.error("Diagnostic result not found");
        }
    }
    
    @PostMapping
    public ApiResponse<DiagnosticResultDto> createDiagnosticResult(@RequestBody DiagnosticResultDto dto, Authentication authentication) {
        try {
            String performedBy = authentication.getName();
            String performedByName = authentication.getName();
            DiagnosticResultDto created = diagnosticResultService.createDiagnosticResult(dto, performedBy, performedByName);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create diagnostic result: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<DiagnosticResultDto> updateDiagnosticResult(@PathVariable Long id, @RequestBody DiagnosticResultDto dto) {
        try {
            Optional<DiagnosticResultDto> updated = diagnosticResultService.updateDiagnosticResult(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Diagnostic result not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update diagnostic result: " + e.getMessage());
        }
    }
    
    @PatchMapping("/{id}/validate")
    public ApiResponse<DiagnosticResultDto> validateDiagnosticResult(@PathVariable Long id,
                                                                    @RequestParam(required = false) String validationNotes,
                                                                    Authentication authentication) {
        try {
            String validatedBy = authentication.getName();
            String validatedByName = authentication.getName(); // TODO: Get display name from user service
            Optional<DiagnosticResultDto> validated = diagnosticResultService.validateDiagnosticResult(id, validatedBy, validatedByName, validationNotes);
            if (validated.isPresent()) {
                return ApiResponse.success(validated.get());
            } else {
                return ApiResponse.error("Diagnostic result not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to validate diagnostic result: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDiagnosticResult(@PathVariable Long id) {
        boolean deleted = diagnosticResultService.deleteDiagnosticResult(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Diagnostic result not found");
        }
    }
}
