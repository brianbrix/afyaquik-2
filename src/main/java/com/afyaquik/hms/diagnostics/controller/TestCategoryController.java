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
import com.afyaquik.hms.diagnostics.dto.TestCategoryDto;
import com.afyaquik.hms.diagnostics.service.TestCategoryService;

@RestController
@RequestMapping("/api/v1/diagnostics/test-categories")
public class TestCategoryController {
    
    private final TestCategoryService testCategoryService;
    
    public TestCategoryController(TestCategoryService testCategoryService) {
        this.testCategoryService = testCategoryService;
    }
    
    @GetMapping
    public ApiResponse<List<TestCategoryDto>> getAllTestCategories(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String testType) {
        
        List<TestCategoryDto> categories;
        
        if (testType != null && !testType.trim().isEmpty()) {
            categories = testCategoryService.getTestCategoriesByType(testType);
        } else if (active != null && active) {
            categories = testCategoryService.getActiveTestCategories();
        } else {
            categories = testCategoryService.getAllTestCategories();
        }
        
        return ApiResponse.success(categories);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<TestCategoryDto> getTestCategoryById(@PathVariable Long id) {
        Optional<TestCategoryDto> category = testCategoryService.getTestCategoryById(id);
        if (category.isPresent()) {
            return ApiResponse.success(category.get());
        } else {
            return ApiResponse.error("Test category not found");
        }
    }
    
    @GetMapping("/code/{categoryCode}")
    public ApiResponse<TestCategoryDto> getTestCategoryByCode(@PathVariable String categoryCode) {
        Optional<TestCategoryDto> category = testCategoryService.getTestCategoryByCode(categoryCode);
        if (category.isPresent()) {
            return ApiResponse.success(category.get());
        } else {
            return ApiResponse.error("Test category not found");
        }
    }
    
    @PostMapping
    public ApiResponse<TestCategoryDto> createTestCategory(@RequestBody TestCategoryDto dto) {
        try {
            TestCategoryDto created = testCategoryService.createTestCategory(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create test category: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<TestCategoryDto> updateTestCategory(@PathVariable Long id, @RequestBody TestCategoryDto dto) {
        try {
            Optional<TestCategoryDto> updated = testCategoryService.updateTestCategory(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("Test category not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update test category: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTestCategory(@PathVariable Long id) {
        boolean deleted = testCategoryService.deleteTestCategory(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Test category not found");
        }
    }
}
