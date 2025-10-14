package com.afyaquik.hms.diagnostics.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.dto.ResultTemplateDto;
import com.afyaquik.hms.diagnostics.service.ResultTemplateService;

@RestController
@RequestMapping("/api/v1/diagnostics/result-templates")
public class ResultTemplateController {
    
    private final ResultTemplateService resultTemplateService;
    
    public ResultTemplateController(ResultTemplateService resultTemplateService) {
        this.resultTemplateService = resultTemplateService;
    }
    
    @GetMapping
    public ApiResponse<List<ResultTemplateDto>> getAllResultTemplates(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long testCatalogId) {
        
        List<ResultTemplateDto> templates;
        
        if (testCatalogId != null) {
            templates = resultTemplateService.getResultTemplatesByTestCatalog(testCatalogId);
        } else if (active != null && active) {
            templates = resultTemplateService.getActiveResultTemplates();
        } else {
            templates = resultTemplateService.getAllResultTemplates();
        }
        
        return ApiResponse.success(templates);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ResultTemplateDto> getResultTemplateById(@PathVariable Long id) {
        Optional<ResultTemplateDto> template = resultTemplateService.getResultTemplateById(id);
        if (template.isPresent()) {
            return ApiResponse.success(template.get());
        } else {
            return ApiResponse.error("Result template not found");
        }
    }
    
    @PostMapping
    public ApiResponse<ResultTemplateDto> createResultTemplate(@RequestBody ResultTemplateDto dto) {
        try {
            ResultTemplateDto created = resultTemplateService.createResultTemplate(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
    return ApiResponse.error("Failed to create result template: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<ResultTemplateDto> updateResultTemplate(@PathVariable Long id, @RequestBody ResultTemplateDto dto) {
        try {
            Optional<ResultTemplateDto> updated = resultTemplateService.updateResultTemplate(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Result template not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update result template: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResultTemplate(@PathVariable Long id) {
        boolean deleted = resultTemplateService.deleteResultTemplate(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Result template not found");
        }
    }
}
