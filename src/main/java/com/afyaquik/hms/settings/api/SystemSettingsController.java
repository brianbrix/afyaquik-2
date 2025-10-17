package com.afyaquik.hms.settings.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.settings.dto.SystemSettingDto;
import com.afyaquik.hms.settings.dto.UpdateSystemSettingRequest;
import com.afyaquik.hms.settings.service.SystemSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    /**
     * Get all system settings (admin only)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getAllSettings() {
        try {
            List<SystemSettingDto> settings = systemSettingsService.getAllSettings();
            return ResponseEntity.ok(ApiResponse.success(settings));
        } catch (Exception e) {
            log.error("Error getting system settings", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get system settings: " + e.getMessage()));
        }
    }

    /**
     * Get a specific setting by key (admin only)
     */
    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemSettingDto>> getSetting(@PathVariable String key) {
        try {
            return systemSettingsService.getSetting(key)
                .map(setting -> ResponseEntity.ok(ApiResponse.success(setting)))
                .orElse(ResponseEntity.status(404)
                    .body(ApiResponse.error("Setting not found: " + key)));
        } catch (Exception e) {
            log.error("Error getting setting: {}", key, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get setting: " + e.getMessage()));
        }
    }

    /**
     * Update a system setting (admin only)
     */
    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemSettingDto>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody UpdateSystemSettingRequest request) {
        try {
            // Ensure the key in the path matches the request
            if (!key.equals(request.settingKey())) {
                return ResponseEntity.status(400)
                    .body(ApiResponse.error("Key mismatch in request"));
            }

            SystemSettingDto updated = systemSettingsService.updateSetting(request);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for setting {}: {}", key, e.getMessage());
            return ResponseEntity.status(400)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating setting: {}", key, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to update setting: " + e.getMessage()));
        }
    }

    /**
     * Initialize default settings (admin only)
     */
    @PostMapping("/init-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> initializeDefaultSettings() {
        try {
            systemSettingsService.initializeDefaultSettings();
            return ResponseEntity.ok(ApiResponse.success("Default settings initialized successfully"));
        } catch (Exception e) {
            log.error("Error initializing default settings", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to initialize default settings: " + e.getMessage()));
        }
    }

    /**
     * Get available timezones (admin only)
     */
    @GetMapping("/timezones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableTimezones() {
        try {
            List<String> timezones = systemSettingsService.getAvailableTimezones();
            return ResponseEntity.ok(ApiResponse.success(timezones));
        } catch (Exception e) {
            log.error("Error getting available timezones", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get timezones: " + e.getMessage()));
        }
    }

    /**
     * Get current timezone (public for frontend use)
     */
    @GetMapping("/timezone")
    public ResponseEntity<ApiResponse<String>> getCurrentTimezone() {
        try {
            String timezone = systemSettingsService.getTimezone();
            return ResponseEntity.ok(ApiResponse.success(timezone));
        } catch (Exception e) {
            log.error("Error getting current timezone", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get timezone: " + e.getMessage()));
        }
    }
}
