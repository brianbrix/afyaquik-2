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
import com.afyaquik.hms.diagnostics.dto.SampleDto;
import com.afyaquik.hms.diagnostics.service.SampleService;

@RestController
@RequestMapping("/api/v1/diagnostics/samples")
public class SampleController {
    
    private final SampleService sampleService;
    
    public SampleController(SampleService sampleService) {
        this.sampleService = sampleService;
    }
    
    @GetMapping
    public ApiResponse<List<SampleDto>> getAllSamples(
            @RequestParam(required = false) Long diagnosticOrderId,
            @RequestParam(required = false) Long diagnosticItemId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long queueItemId,
            @RequestParam(required = false) String status) {
        
        List<SampleDto> samples;
        
        if (diagnosticOrderId != null) {
            samples = sampleService.getSamplesByDiagnosticOrder(diagnosticOrderId);
        } else if (diagnosticItemId != null) {
            samples = sampleService.getSamplesByDiagnosticItem(diagnosticItemId);
        } else if (patientId != null) {
            samples = sampleService.getSamplesByPatient(patientId);
        } else if (queueItemId != null) {
            samples = sampleService.getSamplesByQueueItem(queueItemId);
        } else if (status != null && !status.trim().isEmpty()) {
            samples = sampleService.getSamplesByStatus(status);
        } else {
            samples = sampleService.getAllSamples();
        }
        
        return ApiResponse.success(samples);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<SampleDto> getSampleById(@PathVariable Long id) {
        Optional<SampleDto> sample = sampleService.getSampleById(id);
        if (sample.isPresent()) {
            return ApiResponse.success(sample.get());
        } else {
            return ApiResponse.error("Sample not found");
        }
    }
    
    @GetMapping("/barcode/{barcode}")
    public ApiResponse<SampleDto> getSampleByBarcode(@PathVariable String barcode) {
        Optional<SampleDto> sample = sampleService.getSampleByBarcode(barcode);
        if (sample.isPresent()) {
            return ApiResponse.success(sample.get());
        } else {
            return ApiResponse.error("Sample not found");
        }
    }
    
    @PostMapping
    public ApiResponse<SampleDto> createSample(@RequestBody SampleDto dto, Authentication authentication) {
        try {
            String collectedBy = authentication.getName();
            String collectedByName = authentication.getName(); // TODO: Get display name from user service
            SampleDto created = sampleService.createSample(dto, collectedBy, collectedByName);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create sample: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<SampleDto> updateSample(@PathVariable Long id, @RequestBody SampleDto dto) {
        try {
            Optional<SampleDto> updated = sampleService.updateSample(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Sample not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update sample: " + e.getMessage());
        }
    }
    
    @PatchMapping("/{id}/status")
    public ApiResponse<SampleDto> updateSampleStatus(@PathVariable Long id, 
                                                    @RequestParam String status,
                                                    @RequestParam(required = false) String receivedBy,
                                                    @RequestParam(required = false) String receivedByName,
                                                    Authentication authentication) {
        try {
            String userBy = receivedBy != null ? receivedBy : authentication.getName();
            String userName = receivedByName != null ? receivedByName : authentication.getName();
            
            Optional<SampleDto> updated = sampleService.updateSampleStatus(id, status, userBy, userName);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Sample not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update sample status: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSample(@PathVariable Long id) {
        boolean deleted = sampleService.deleteSample(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Sample not found");
        }
    }
}
