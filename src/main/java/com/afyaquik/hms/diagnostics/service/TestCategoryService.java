package com.afyaquik.hms.diagnostics.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.TestCategory;
import com.afyaquik.hms.diagnostics.dto.TestCategoryDto;
import com.afyaquik.hms.diagnostics.repository.TestCategoryRepository;

@Service
@Transactional
public class TestCategoryService {
    
    private final TestCategoryRepository testCategoryRepository;
    
    public TestCategoryService(TestCategoryRepository testCategoryRepository) {
        this.testCategoryRepository = testCategoryRepository;
    }
    
    public List<TestCategoryDto> getAllTestCategories() {
        List<TestCategory> categories = testCategoryRepository.findAll();
        return categories.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCategoryDto> getActiveTestCategories() {
        List<TestCategory> categories = testCategoryRepository.findByActiveTrueOrderBySortOrderAscCategoryNameAsc();
        return categories.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCategoryDto> getTestCategoriesByType(String testType) {
        List<TestCategory> categories = testCategoryRepository.findByTestTypeAndActiveTrueOrderBySortOrderAscCategoryNameAsc(
            com.afyaquik.hms.diagnostics.domain.TestType.valueOf(testType));
        return categories.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public Optional<TestCategoryDto> getTestCategoryById(Long id) {
        return testCategoryRepository.findById(id).map(this::convertToDto);
    }
    
    public Optional<TestCategoryDto> getTestCategoryByCode(String categoryCode) {
        return testCategoryRepository.findByCategoryCode(categoryCode).map(this::convertToDto);
    }
    
    public TestCategoryDto createTestCategory(TestCategoryDto dto) {
        TestCategory category = convertToEntity(dto);
        category.setId(null); // Ensure it's a new entity
        category.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        TestCategory saved = testCategoryRepository.save(category);
        return convertToDto(saved);
    }
    
    public Optional<TestCategoryDto> updateTestCategory(Long id, TestCategoryDto dto) {
        return testCategoryRepository.findById(id).map(existing -> {
            TestCategory updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve existing tenant ID
            TestCategory saved = testCategoryRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteTestCategory(Long id) {
        if (!testCategoryRepository.existsById(id)) {
            return false;
        }
        testCategoryRepository.deleteById(id);
        return true;
    }
    
    private TestCategoryDto convertToDto(TestCategory category) {
        TestCategoryDto dto = new TestCategoryDto();
        dto.setId(category.getId());
        dto.setCategoryCode(category.getCategoryCode());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setTestType(category.getTestType());
        dto.setActive(category.isActive());
        dto.setSortOrder(category.getSortOrder());
        return dto;
    }
    
    private TestCategory convertToEntity(TestCategoryDto dto) {
        TestCategory category = new TestCategory();
        category.setId(dto.getId());
        category.setCategoryCode(dto.getCategoryCode());
        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        category.setTestType(dto.getTestType());
        category.setActive(dto.isActive());
        category.setSortOrder(dto.getSortOrder());
        return category;
    }
}
