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
import com.afyaquik.hms.diagnostics.dto.TestCatalogDto;
import com.afyaquik.hms.diagnostics.service.TestCatalogService;

@RestController
@RequestMapping("/api/v1/diagnostics/test-catalogs")
public class TestCatalogController {
    
    private final TestCatalogService testCatalogService;
    
    public TestCatalogController(TestCatalogService testCatalogService) {
        this.testCatalogService = testCatalogService;
    }
    
    @GetMapping
    public ApiResponse<List<TestCatalogDto>> getAllTestCatalogs(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String testType,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String search) {
        
        List<TestCatalogDto> catalogs;
        
        if (search != null && !search.trim().isEmpty()) {
            catalogs = testCatalogService.searchTestCatalogs(search);
        } else if (testType != null && !testType.trim().isEmpty()) {
            catalogs = testCatalogService.getTestCatalogsByType(testType);
        } else if (department != null && !department.trim().isEmpty()) {
            catalogs = testCatalogService.getTestCatalogsByDepartment(department);
        } else if (active != null && active) {
            catalogs = testCatalogService.getActiveTestCatalogs();
        } else {
            catalogs = testCatalogService.getAllTestCatalogs();
        }
        
        return ApiResponse.success(catalogs);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<TestCatalogDto> getTestCatalogById(@PathVariable Long id) {
        Optional<TestCatalogDto> catalog = testCatalogService.getTestCatalogById(id);
        if (catalog.isPresent()) {
            return ApiResponse.success(catalog.get());
        } else {
            return ApiResponse.error("Test catalog not found");
        }
    }
    
    @GetMapping("/code/{testCode}")
    public ApiResponse<TestCatalogDto> getTestCatalogByCode(@PathVariable String testCode) {
        Optional<TestCatalogDto> catalog = testCatalogService.getTestCatalogByCode(testCode);
        if (catalog.isPresent()) {
            return ApiResponse.success(catalog.get());
        } else {
            return ApiResponse.error("Test catalog not found");
        }
    }
    
    @GetMapping("/departments")
    public ApiResponse<List<String>> getDistinctDepartments() {
        List<String> departments = testCatalogService.getDistinctDepartments();
        return ApiResponse.success(departments);
    }
    
    @PostMapping
    public ApiResponse<TestCatalogDto> createTestCatalog(@RequestBody TestCatalogDto dto) {
        try {
            TestCatalogDto created = testCatalogService.createTestCatalog(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create test catalog: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<TestCatalogDto> updateTestCatalog(@PathVariable Long id, @RequestBody TestCatalogDto dto) {
        try {
            Optional<TestCatalogDto> updated = testCatalogService.updateTestCatalog(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Test catalog not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update test catalog: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTestCatalog(@PathVariable Long id) {
        boolean deleted = testCatalogService.deleteTestCatalog(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Test catalog not found");
        }
    }
}
