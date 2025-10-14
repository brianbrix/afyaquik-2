package com.afyaquik.hms.diagnostics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.TestCategory;
import com.afyaquik.hms.diagnostics.domain.TestType;

@Repository
public interface TestCategoryRepository extends JpaRepository<TestCategory, Long> {
    
    Optional<TestCategory> findByCategoryCode(String categoryCode);
    
    List<TestCategory> findByActiveTrueOrderBySortOrderAscCategoryNameAsc();
    
    List<TestCategory> findByTestTypeAndActiveTrueOrderBySortOrderAscCategoryNameAsc(TestType testType);
}
