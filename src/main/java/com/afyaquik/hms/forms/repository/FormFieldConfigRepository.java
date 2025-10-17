package com.afyaquik.hms.forms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.forms.domain.FormFieldConfig;

/**
 * Repository for form field configurations.
 */
@Repository
public interface FormFieldConfigRepository extends JpaRepository<FormFieldConfig, Long> {
    
    /**
     * Find all enabled field configurations for a specific form type in a tenant.
     */
    @Query("SELECT f FROM FormFieldConfig f WHERE f.tenantId = :tenantId AND f.formType = :formType AND f.isEnabled = true ORDER BY f.displayOrder, f.fieldKey")
    List<FormFieldConfig> findEnabledByFormType(@Param("tenantId") String tenantId, @Param("formType") String formType);
    
    /**
     * Find all field configurations for a specific form type in a tenant.
     */
    @Query("SELECT f FROM FormFieldConfig f WHERE f.tenantId = :tenantId AND f.formType = :formType ORDER BY f.displayOrder, f.fieldKey")
    List<FormFieldConfig> findByFormType(@Param("tenantId") String tenantId, @Param("formType") String formType);
    
    /**
     * Find field configuration by tenant, form type, and field key.
     */
    FormFieldConfig findByTenantIdAndFormTypeAndFieldKey(String tenantId, String formType, String fieldKey);
    
    /**
     * Check if a field configuration exists for a tenant and form type.
     */
    boolean existsByTenantIdAndFormTypeAndFieldKey(String tenantId, String formType, String fieldKey);
}
