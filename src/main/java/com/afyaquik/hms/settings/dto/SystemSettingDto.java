package com.afyaquik.hms.settings.dto;

/**
 * DTO for system settings
 */
public record SystemSettingDto(
    Long id,
    String settingKey,
    String settingValue,
    String defaultValue,
    String description,
    String settingType,
    boolean isEditable,
    String effectiveValue
) {
    public SystemSettingDto {
        // Use effective value if settingValue is null
        if (effectiveValue == null) {
            effectiveValue = settingValue != null ? settingValue : defaultValue;
        }
    }
}
