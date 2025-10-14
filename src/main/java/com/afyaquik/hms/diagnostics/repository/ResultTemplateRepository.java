package com.afyaquik.hms.diagnostics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.ResultTemplate;

@Repository
public interface ResultTemplateRepository extends JpaRepository<ResultTemplate, Long> {
    
    List<ResultTemplate> findByActiveTrueOrderBySortOrderAsc();
    
    List<ResultTemplate> findByTestCatalogIdOrderBySortOrderAsc(Long testCatalogId);
    
    @Query("SELECT rt FROM ResultTemplate rt WHERE rt.testCatalog.id = :testCatalogId AND rt.active = true ORDER BY rt.sortOrder ASC")
    List<ResultTemplate> findByTestCatalogIdAndActiveTrueOrderBySortOrderAsc(@Param("testCatalogId") Long testCatalogId);
    
    @Query("SELECT rt FROM ResultTemplate rt WHERE rt.testCatalog.testType = :testType AND rt.active = true ORDER BY rt.sortOrder ASC")
    List<ResultTemplate> findByTestCatalogTestTypeAndActiveTrueOrderBySortOrderAsc(@Param("testType") String testType);
}
