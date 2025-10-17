package com.afyaquik.hms.settings.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.settings.domain.SystemSetting;

public interface SystemSettingRepository extends TenantAwareRepository<SystemSetting, Long>, JpaSpecificationExecutor<SystemSetting> {

    /**
     * Find a setting by key for the current tenant
     */
    Optional<SystemSetting> findBySettingKey(String settingKey);

    /**
     * Find all settings for the current tenant
     */
    List<SystemSetting> findAllByOrderBySettingKey();

    /**
     * Check if a setting exists for the current tenant
     */
    boolean existsBySettingKey(String settingKey);

    /**
     * Find settings by type for the current tenant
     */
    List<SystemSetting> findBySettingTypeOrderBySettingKey(String settingType);

    /**
     * Find editable settings for the current tenant
     */
    @Query("SELECT s FROM SystemSetting s WHERE s.tenantId = :tenantId AND s.isEditable = true ORDER BY s.settingKey")
    List<SystemSetting> findEditableSettings(@Param("tenantId") String tenantId);
}
