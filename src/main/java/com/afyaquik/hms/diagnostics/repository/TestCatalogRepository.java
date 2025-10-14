package com.afyaquik.hms.diagnostics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.TestCatalog;
import com.afyaquik.hms.diagnostics.domain.TestType;

@Repository
public interface TestCatalogRepository extends JpaRepository<TestCatalog, Long> {
    
    Optional<TestCatalog> findByTestCode(String testCode);
    
    List<TestCatalog> findByActiveTrueOrderByTestNameAsc();
    
    List<TestCatalog> findByTestTypeAndActiveTrueOrderByTestNameAsc(TestType testType);
    
    List<TestCatalog> findByDepartmentAndActiveTrueOrderByTestNameAsc(String department);
    
    @Query("SELECT t FROM TestCatalog t WHERE t.active = true AND (LOWER(t.testName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.testCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) ORDER BY t.testName ASC")
    List<TestCatalog> findByActiveTrueAndTestNameContainingIgnoreCaseOrTestCodeContainingIgnoreCaseOrderByTestNameAsc(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT DISTINCT t.department FROM TestCatalog t WHERE t.active = true ORDER BY t.department")
    List<String> findDistinctDepartmentsByActiveTrue();
}
