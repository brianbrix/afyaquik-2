package com.afyaquik.hms.settings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request to update a system setting
 */
public record UpdateSystemSettingRequest(
    @NotBlank(message = "Setting key is required")
    String settingKey,
    
    @Size(max = 1000, message = "Setting value cannot exceed 1000 characters")
    String settingValue
) {}
