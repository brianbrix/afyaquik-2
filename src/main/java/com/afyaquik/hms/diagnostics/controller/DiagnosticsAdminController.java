package com.afyaquik.hms.diagnostics.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.diagnostics.dto.DiagnosticOrderDto;
import com.afyaquik.hms.diagnostics.dto.DiagnosticResultDto;
import com.afyaquik.hms.diagnostics.dto.ResultTemplateDto;
import com.afyaquik.hms.diagnostics.dto.SampleDto;
import com.afyaquik.hms.diagnostics.dto.TestCatalogDto;
import com.afyaquik.hms.diagnostics.dto.TestCategoryDto;
import com.afyaquik.hms.diagnostics.service.DiagnosticOrderService;
import com.afyaquik.hms.diagnostics.service.DiagnosticResultService;
import com.afyaquik.hms.diagnostics.service.ResultTemplateService;
import com.afyaquik.hms.diagnostics.service.SampleService;
import com.afyaquik.hms.diagnostics.service.TestCatalogService;
import com.afyaquik.hms.diagnostics.service.TestCategoryService;

@RestController
@RequestMapping("/api/v1/admin/diagnostics")
public class DiagnosticsAdminController {
    
    private final TestCatalogService testCatalogService;
    private final TestCategoryService testCategoryService;
    private final ResultTemplateService resultTemplateService;
    private final DiagnosticOrderService diagnosticOrderService;
    private final SampleService sampleService;
    private final DiagnosticResultService diagnosticResultService;
    
    public DiagnosticsAdminController(TestCatalogService testCatalogService,
                                    TestCategoryService testCategoryService,
                                    ResultTemplateService resultTemplateService,
                                    DiagnosticOrderService diagnosticOrderService,
                                    SampleService sampleService,
                                    DiagnosticResultService diagnosticResultService) {
        this.testCatalogService = testCatalogService;
        this.testCategoryService = testCategoryService;
        this.resultTemplateService = resultTemplateService;
        this.diagnosticOrderService = diagnosticOrderService;
        this.sampleService = sampleService;
        this.diagnosticResultService = diagnosticResultService;
    }
    
    // Test Catalog Admin APIs
    @GetMapping("/test-catalogs")
    public ApiResponse<List<TestCatalogDto>> getAllTestCatalogs() {
        List<TestCatalogDto> catalogs = testCatalogService.getAllTestCatalogs();
        return ApiResponse.success(catalogs);
    }
    
    @PostMapping("/test-catalogs")
    public ApiResponse<TestCatalogDto> createTestCatalog(@RequestBody TestCatalogDto dto) {
        try {
            TestCatalogDto created = testCatalogService.createTestCatalog(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create test catalog: " + e.getMessage());
        }
    }
    
    @PutMapping("/test-catalogs/{id}")
    public ApiResponse<TestCatalogDto> updateTestCatalog(@PathVariable Long id, @RequestBody TestCatalogDto dto) {
        try {
            var updated = testCatalogService.updateTestCatalog(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Test catalog not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update test catalog: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/test-catalogs/{id}")
    public ApiResponse<Void> deleteTestCatalog(@PathVariable Long id) {
        boolean deleted = testCatalogService.deleteTestCatalog(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Test catalog not found");
        }
    }
    
    // Test Category Admin APIs
    @GetMapping("/test-categories")
    public ApiResponse<List<TestCategoryDto>> getAllTestCategories() {
        List<TestCategoryDto> categories = testCategoryService.getAllTestCategories();
        return ApiResponse.success(categories);
    }
    
    @PostMapping("/test-categories")
    public ApiResponse<TestCategoryDto> createTestCategory(@RequestBody TestCategoryDto dto) {
        try {
            TestCategoryDto created = testCategoryService.createTestCategory(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create test category: " + e.getMessage());
        }
    }
    
    @PutMapping("/test-categories/{id}")
    public ApiResponse<TestCategoryDto> updateTestCategory(@PathVariable Long id, @RequestBody TestCategoryDto dto) {
        try {
            var updated = testCategoryService.updateTestCategory(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Test category not found");
            }
        } catch (Exception e) {
                return ApiResponse.error("Failed to update test category: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/test-categories/{id}")
    public ApiResponse<Void> deleteTestCategory(@PathVariable Long id) {
        boolean deleted = testCategoryService.deleteTestCategory(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Test category not found");
        }
    }
    
    // Result Template Admin APIs
    @GetMapping("/result-templates")
    public ApiResponse<List<ResultTemplateDto>> getAllResultTemplates() {
        List<ResultTemplateDto> templates = resultTemplateService.getAllResultTemplates();
        return ApiResponse.success(templates);
    }
    
    @PostMapping("/result-templates")
    public ApiResponse<ResultTemplateDto> createResultTemplate(@RequestBody ResultTemplateDto dto) {
        try {
            ResultTemplateDto created = resultTemplateService.createResultTemplate(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create result template: " + e.getMessage());
        }
    }
    
    @PutMapping("/result-templates/{id}")
    public ApiResponse<ResultTemplateDto> updateResultTemplate(@PathVariable Long id, @RequestBody ResultTemplateDto dto) {
        try {
            var updated = resultTemplateService.updateResultTemplate(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Result template not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update result template: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/result-templates/{id}")
    public ApiResponse<Void> deleteResultTemplate(@PathVariable Long id) {
        boolean deleted = resultTemplateService.deleteResultTemplate(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Result template not found");
        }
    }
    
    // Diagnostic Orders Admin APIs
    @GetMapping("/orders")
    public ApiResponse<List<DiagnosticOrderDto>> getAllDiagnosticOrders() {
        // This would need to be implemented in DiagnosticOrderService
        return ApiResponse.success(List.of());
    }
    
    // Samples Admin APIs
    @GetMapping("/samples")
    public ApiResponse<List<SampleDto>> getAllSamples() {
        List<SampleDto> samples = sampleService.getAllSamples();
        return ApiResponse.success(samples);
    }
    
    // Diagnostic Results Admin APIs
    @GetMapping("/results")
    public ApiResponse<List<DiagnosticResultDto>> getAllDiagnosticResults() {
        List<DiagnosticResultDto> results = diagnosticResultService.getAllDiagnosticResults();
        return ApiResponse.success(results);
    }
    
    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get counts for dashboard
        stats.put("totalTestCatalogs", testCatalogService.getAllTestCatalogs().size());
        stats.put("activeTestCatalogs", testCatalogService.getActiveTestCatalogs().size());
        stats.put("totalTestCategories", testCategoryService.getAllTestCategories().size());
        stats.put("activeTestCategories", testCategoryService.getActiveTestCategories().size());
        stats.put("totalResultTemplates", resultTemplateService.getAllResultTemplates().size());
        stats.put("activeResultTemplates", resultTemplateService.getActiveResultTemplates().size());
        stats.put("totalSamples", sampleService.getAllSamples().size());
        stats.put("totalResults", diagnosticResultService.getAllDiagnosticResults().size());
        
        return ApiResponse.success(stats);
    }
}
