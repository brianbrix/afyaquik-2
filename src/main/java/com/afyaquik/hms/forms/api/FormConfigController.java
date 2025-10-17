package com.afyaquik.hms.forms.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.forms.domain.FormFieldConfig;
import com.afyaquik.hms.forms.service.FormConfigService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST API controller for form field configurations.
 */
@RestController
@RequestMapping("/api/v1/forms")
@RequiredArgsConstructor
@Slf4j
public class FormConfigController {
    
    private final FormConfigService formConfigService;
    
    /**
     * Get enabled field configurations for a form type.
     */
    @GetMapping("/{formType}/fields")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'CREATE_PATIENT') or hasPermission(null, 'EDIT_PATIENT')")
    public ResponseEntity<ApiResponse<List<FormFieldConfig>>> getEnabledFields(@PathVariable String formType) {
        try {
            log.info("Getting enabled fields for form type: {}", formType);
            List<FormFieldConfig> fields = formConfigService.getEnabledFields(formType);
            return ResponseEntity.ok(ApiResponse.success(fields, 200, "Form fields retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving form fields", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve form fields: " + e.getMessage()));
        }
    }
    
    /**
     * Get all field configurations for a form type (admin only).
     */
    @GetMapping("/{formType}/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FormFieldConfig>>> getAllFields(@PathVariable String formType) {
        try {
            log.info("Getting all fields for form type: {}", formType);
            List<FormFieldConfig> fields = formConfigService.getAllFields(formType);
            return ResponseEntity.ok(ApiResponse.success(fields, 200, "Form configuration retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving form configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve form configuration: " + e.getMessage()));
        }
    }
    
    /**
     * Update field configurations for a form type (admin only).
     */
    @PutMapping("/{formType}/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FormFieldConfig>>> updateFieldConfigurations(
            @PathVariable String formType,
            @RequestBody List<FormFieldConfig> configurations) {
        try {
            log.info("Updating field configurations for form type: {}", formType);
            List<FormFieldConfig> updatedConfigs = formConfigService.updateFieldConfigurations(formType, configurations);
            return ResponseEntity.ok(ApiResponse.success(updatedConfigs, 200, "Form configuration updated successfully"));
        } catch (Exception e) {
            log.error("Error updating form configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update form configuration: " + e.getMessage()));
        }
    }
    
    /**
     * Initialize default field configurations for patient form (admin only).
     */
    @PostMapping("/patient/init-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> initializeDefaultPatientForm() {
        try {
            log.info("Initializing default patient form configuration");
            formConfigService.initializeDefaultPatientFormConfig();
            return ResponseEntity.ok(ApiResponse.success("Default patient form configuration initialized", 200, "Default configuration created successfully"));
        } catch (Exception e) {
            log.error("Error initializing default patient form", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to initialize default patient form: " + e.getMessage()));
        }
    }
    
    /**
     * Force reinitialize default field configurations for patient form (admin only).
     */
    @PostMapping("/patient/force-reinit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> forceReinitializeDefaultPatientForm() {
        try {
            log.info("Force reinitializing default patient form configuration");
            formConfigService.forceReinitializeDefaultPatientFormConfig();
            return ResponseEntity.ok(ApiResponse.success("Default patient form configuration force reinitialized", 200, "Default configuration recreated successfully"));
        } catch (Exception e) {
            log.error("Error force reinitializing default patient form", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to force reinitialize default patient form: " + e.getMessage()));
        }
    }
}
