package com.afyaquik.hms.settings.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.settings.domain.SystemSetting;
import com.afyaquik.hms.settings.dto.SystemSettingDto;
import com.afyaquik.hms.settings.dto.UpdateSystemSettingRequest;
import com.afyaquik.hms.settings.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsService {

    private final SystemSettingRepository systemSettingRepository;

    // Setting keys constants
    public static final String TIMEZONE_KEY = "system.timezone";
    public static final String DATE_FORMAT_KEY = "system.date_format";
    public static final String TIME_FORMAT_KEY = "system.time_format";
    public static final String CURRENCY_KEY = "system.currency";
    public static final String LANGUAGE_KEY = "system.language";
    public static final String QUEUE_WAITING_THRESHOLD_KEY = "notification.queue_waiting_threshold_minutes";

    /**
     * Get all system settings for the current tenant
     */
    public List<SystemSettingDto> getAllSettings() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting all system settings for tenant: {}", tenantId);
        
        return systemSettingRepository.findAllByOrderBySettingKey()
            .stream()
            .map(this::toDto)
            .toList();
    }

    /**
     * Get a specific setting by key
     */
    public Optional<SystemSettingDto> getSetting(String settingKey) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting setting {} for tenant: {}", settingKey, tenantId);
        
        return systemSettingRepository.findBySettingKey(settingKey)
            .map(this::toDto);
    }

    /**
     * Get setting value by key, returns default if not found
     */
    public String getSettingValue(String settingKey) {
        return getSetting(settingKey)
            .map(SystemSettingDto::effectiveValue)
            .orElse(null);
    }

    /**
     * Get timezone setting, defaults to Africa/Nairobi
     */
    public String getTimezone() {
        return getSettingValue(TIMEZONE_KEY);
    }

    /**
     * Get timezone as ZoneId, defaults to Africa/Nairobi
     */
    public ZoneId getTimezoneAsZoneId() {
        String timezone = getTimezone();
        if (timezone == null || timezone.trim().isEmpty()) {
            return ZoneId.of("Africa/Nairobi");
        }
        try {
            return ZoneId.of(timezone);
        } catch (Exception e) {
            log.warn("Invalid timezone '{}', falling back to Africa/Nairobi", timezone);
            return ZoneId.of("Africa/Nairobi");
        }
    }

    /**
     * Get queue waiting threshold in minutes, defaults to 30
     */
    public int getQueueWaitingThresholdMinutes() {
        String threshold = getSettingValue(QUEUE_WAITING_THRESHOLD_KEY);
        if (threshold == null || threshold.trim().isEmpty()) {
            return 30; // Default to 30 minutes
        }
        try {
            int minutes = Integer.parseInt(threshold.trim());
            return Math.max(1, minutes); // Ensure at least 1 minute
        } catch (NumberFormatException e) {
            log.warn("Invalid queue waiting threshold '{}', falling back to 30 minutes", threshold);
            return 30;
        }
    }

    /**
     * Update a system setting
     */
    @Transactional
    public SystemSettingDto updateSetting(UpdateSystemSettingRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating setting {} for tenant: {}", request.settingKey(), tenantId);

        SystemSetting setting = systemSettingRepository.findBySettingKey(request.settingKey())
            .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + request.settingKey()));

        if (!setting.isEditable()) {
            throw new IllegalArgumentException("Setting is not editable: " + request.settingKey());
        }

        setting.setSettingValue(request.settingValue());
        SystemSetting saved = systemSettingRepository.save(setting);
        
        log.info("Updated setting {} for tenant: {}", request.settingKey(), tenantId);
        return toDto(saved);
    }

    /**
     * Initialize default system settings for a tenant
     */
    @Transactional
    public void initializeDefaultSettings() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Initializing default system settings for tenant: {}", tenantId);

        // Check if settings already exist
        if (systemSettingRepository.existsBySettingKey(TIMEZONE_KEY)) {
            log.info("System settings already exist for tenant: {}", tenantId);
            return;
        }

        // Create default settings
        List<SystemSetting> defaultSettings = List.of(
            createDefaultSetting(TIMEZONE_KEY, "Africa/Nairobi", "Africa/Nairobi", 
                "System timezone for all date/time operations", "TIMEZONE"),
            createDefaultSetting(DATE_FORMAT_KEY, "MM/dd/yyyy", "MM/dd/yyyy", 
                "Default date format for display", "STRING"),
            createDefaultSetting(TIME_FORMAT_KEY, "12", "12", 
                "Time format: 12 (12-hour) or 24 (24-hour)", "STRING"),
            createDefaultSetting(CURRENCY_KEY, "USD", "USD", 
                "Default currency code", "STRING"),
            createDefaultSetting(LANGUAGE_KEY, "en", "en", 
                "Default language code", "STRING"),
            createDefaultSetting(QUEUE_WAITING_THRESHOLD_KEY, "30", "30", 
                "Minutes to wait before sending queue waiting notifications", "NUMBER")
        );

        systemSettingRepository.saveAll(defaultSettings);
        log.info("Initialized default system settings for tenant: {}", tenantId);
    }

    /**
     * Get available timezones
     */
    public List<String> getAvailableTimezones() {
        return ZoneId.getAvailableZoneIds()
            .stream()
            .sorted()
            .toList();
    }

    private SystemSetting createDefaultSetting(String key, String value, String defaultValue, 
                                             String description, String type) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        SystemSetting setting = new SystemSetting();
        setting.setTenantId(tenantId);
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setDefaultValue(defaultValue);
        setting.setDescription(description);
        setting.setSettingType(type);
        setting.setEditable(true);
        return setting;
    }

    private SystemSettingDto toDto(SystemSetting setting) {
        return new SystemSettingDto(
            setting.getId(),
            setting.getSettingKey(),
            setting.getSettingValue(),
            setting.getDefaultValue(),
            setting.getDescription(),
            setting.getSettingType(),
            setting.isEditable(),
            setting.getEffectiveValue()
        );
    }
}
