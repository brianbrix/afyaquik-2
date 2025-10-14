package com.afyaquik.hms.diagnostics.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.TestCatalog;
import com.afyaquik.hms.diagnostics.domain.TestCategory;
import com.afyaquik.hms.diagnostics.dto.TestCatalogDto;
import com.afyaquik.hms.diagnostics.repository.TestCatalogRepository;
import com.afyaquik.hms.diagnostics.repository.TestCategoryRepository;

@Service
@Transactional
public class TestCatalogService {
    
    private final TestCatalogRepository testCatalogRepository;
    private final TestCategoryRepository testCategoryRepository;
    
    public TestCatalogService(TestCatalogRepository testCatalogRepository, 
                             TestCategoryRepository testCategoryRepository) {
        this.testCatalogRepository = testCatalogRepository;
        this.testCategoryRepository = testCategoryRepository;
    }
    
    public List<TestCatalogDto> getAllTestCatalogs() {
        List<TestCatalog> catalogs = testCatalogRepository.findAll();
        return catalogs.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCatalogDto> getActiveTestCatalogs() {
        List<TestCatalog> catalogs = testCatalogRepository.findByActiveTrueOrderByTestNameAsc();
        return catalogs.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCatalogDto> getTestCatalogsByType(String testType) {
        List<TestCatalog> catalogs = testCatalogRepository.findByTestTypeAndActiveTrueOrderByTestNameAsc(
            com.afyaquik.hms.diagnostics.domain.TestType.valueOf(testType));
        return catalogs.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCatalogDto> getTestCatalogsByDepartment(String department) {
        List<TestCatalog> catalogs = testCatalogRepository.findByDepartmentAndActiveTrueOrderByTestNameAsc(department);
        return catalogs.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<TestCatalogDto> searchTestCatalogs(String searchTerm) {
        List<TestCatalog> catalogs = testCatalogRepository.findByActiveTrueAndTestNameContainingIgnoreCaseOrTestCodeContainingIgnoreCaseOrderByTestNameAsc(searchTerm);
        return catalogs.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<String> getDistinctDepartments() {
        return testCatalogRepository.findDistinctDepartmentsByActiveTrue();
    }
    
    public Optional<TestCatalogDto> getTestCatalogById(Long id) {
        return testCatalogRepository.findById(id).map(this::convertToDto);
    }
    
    public Optional<TestCatalogDto> getTestCatalogByCode(String testCode) {
        return testCatalogRepository.findByTestCode(testCode).map(this::convertToDto);
    }
    
    public TestCatalogDto createTestCatalog(TestCatalogDto dto) {
        TestCatalog catalog = convertToEntity(dto);
        catalog.setId(null); // Ensure it's a new entity
        catalog.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        TestCatalog saved = testCatalogRepository.save(catalog);
        return convertToDto(saved);
    }
    
    public Optional<TestCatalogDto> updateTestCatalog(Long id, TestCatalogDto dto) {
        return testCatalogRepository.findById(id).map(existing -> {
            TestCatalog updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve existing tenant ID
            TestCatalog saved = testCatalogRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteTestCatalog(Long id) {
        if (!testCatalogRepository.existsById(id)) {
            return false;
        }
        testCatalogRepository.deleteById(id);
        return true;
    }
    
    private TestCatalogDto convertToDto(TestCatalog catalog) {
        TestCatalogDto dto = new TestCatalogDto();
        dto.setId(catalog.getId());
        dto.setTestCode(catalog.getTestCode());
        dto.setTestName(catalog.getTestName());
        dto.setDescription(catalog.getDescription());
        dto.setTestCategoryId(catalog.getTestCategory().getId());
        dto.setCategoryName(catalog.getTestCategory().getCategoryName());
        dto.setTestType(catalog.getTestType());
        dto.setCost(catalog.getCost());
        dto.setDepartment(catalog.getDepartment());
        dto.setDepartmentName(catalog.getDepartmentName());
        dto.setActive(catalog.isActive());
        dto.setInstructions(catalog.getInstructions());
        dto.setPreparationInstructions(catalog.getPreparationInstructions());
        dto.setEstimatedDurationMinutes(catalog.getEstimatedDurationMinutes());
        return dto;
    }
    
    private TestCatalog convertToEntity(TestCatalogDto dto) {
        TestCatalog catalog = new TestCatalog();
        catalog.setId(dto.getId());
        catalog.setTestCode(dto.getTestCode());
        catalog.setTestName(dto.getTestName());
        catalog.setDescription(dto.getDescription());
        
        // Set test category
        if (dto.getTestCategoryId() != null) {
            TestCategory category = testCategoryRepository.findById(dto.getTestCategoryId())
                .orElseThrow(() -> new RuntimeException("Test category not found: " + dto.getTestCategoryId()));
            catalog.setTestCategory(category);
        }
        
        catalog.setTestType(dto.getTestType());
        catalog.setCost(dto.getCost());
        catalog.setDepartment(dto.getDepartment());
        catalog.setDepartmentName(dto.getDepartmentName());
        catalog.setActive(dto.isActive());
        catalog.setInstructions(dto.getInstructions());
        catalog.setPreparationInstructions(dto.getPreparationInstructions());
        catalog.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        return catalog;
    }
}
