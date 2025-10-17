package com.afyaquik.hms.forms.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.forms.domain.FormFieldConfig;
import com.afyaquik.hms.forms.repository.FormFieldConfigRepository;
import com.afyaquik.hms.insurance.dto.InsuranceProviderDto;
import com.afyaquik.hms.insurance.service.InsuranceProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing form field configurations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FormConfigService {
    
    private final FormFieldConfigRepository formFieldConfigRepository;
    private final InsuranceProviderService insuranceProviderService;
    
    /**
     * Get all enabled field configurations for a form type.
     */
    public List<FormFieldConfig> getEnabledFields(String formType) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting enabled fields for form type: {} in tenant: {}", formType, tenantId);
        
        return formFieldConfigRepository.findEnabledByFormType(tenantId, formType);
    }
    
    /**
     * Get all field configurations for a form type (including disabled).
     */
    public List<FormFieldConfig> getAllFields(String formType) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting all fields for form type: {} in tenant: {}", formType, tenantId);
        
        List<FormFieldConfig> fields = formFieldConfigRepository.findByFormType(tenantId, formType);
        
        // Enhance select fields with dynamic options
        for (FormFieldConfig field : fields) {
            if ("select".equals(field.getFieldType())) {
                if ("insuranceProvider".equals(field.getFieldKey())) {
                    field = enhanceInsuranceProviderField(field);
                } else if ("insurancePlan".equals(field.getFieldKey())) {
                    field = enhanceInsurancePlanField(field);
                }
            }
        }
        
        return fields;
    }
    
    /**
     * Enhance insurance provider field with dynamic options.
     */
    private FormFieldConfig enhanceInsuranceProviderField(FormFieldConfig field) {
        try {
            List<InsuranceProviderDto> providers = insuranceProviderService.getAllProviders();
            String optionsJson = "{\"options\":[" + 
                providers.stream()
                    .map(provider -> "{\"value\":\"" + provider.getId() + "\",\"label\":\"" + provider.getName() + "\"}")
                    .reduce((a, b) -> a + "," + b)
                    .orElse("") + 
                "]}";
            field.setFieldOptions(optionsJson);
        } catch (Exception e) {
            log.error("Error enhancing insurance provider field with dynamic options", e);
        }
        return field;
    }
    
    /**
     * Enhance insurance plan field with dynamic options.
     * Note: This will be populated by frontend based on selected provider.
     */
    private FormFieldConfig enhanceInsurancePlanField(FormFieldConfig field) {
        try {
            // For now, set empty options - frontend will populate based on selected provider
            field.setFieldOptions("{\"options\":[],\"dependsOn\":\"insuranceProvider\"}");
        } catch (Exception e) {
            log.error("Error enhancing insurance plan field with dynamic options", e);
        }
        return field;
    }
    
    /**
     * Update field configurations for a form type.
     */
    @Transactional
    public List<FormFieldConfig> updateFieldConfigurations(String formType, List<FormFieldConfig> configurations) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating field configurations for form type: {} in tenant: {}", formType, tenantId);
        
        // Get existing configurations
        List<FormFieldConfig> existingConfigs = formFieldConfigRepository.findByFormType(tenantId, formType);
        
        // Update or create configurations
        for (FormFieldConfig newConfig : configurations) {
            newConfig.setTenantId(tenantId);
            newConfig.setFormType(formType);
            newConfig.setUpdatedAt(LocalDateTime.now());
            
            // Check if this configuration already exists
            FormFieldConfig existingConfig = existingConfigs.stream()
                .filter(existing -> existing.getFieldKey().equals(newConfig.getFieldKey()))
                .findFirst()
                .orElse(null);
            
            if (existingConfig != null) {
                // Update existing configuration
                existingConfig.setFieldLabel(newConfig.getFieldLabel());
                existingConfig.setFieldType(newConfig.getFieldType());
                existingConfig.setSection(newConfig.getSection());
                existingConfig.setIsEnabled(newConfig.getIsEnabled());
                existingConfig.setIsRequired(newConfig.getIsRequired());
                existingConfig.setDisplayOrder(newConfig.getDisplayOrder());
                existingConfig.setValidationRules(newConfig.getValidationRules());
                existingConfig.setFieldOptions(newConfig.getFieldOptions());
                existingConfig.setUpdatedAt(LocalDateTime.now());
                formFieldConfigRepository.save(existingConfig);
            } else {
                // Create new configuration
                newConfig.setCreatedAt(LocalDateTime.now());
                formFieldConfigRepository.save(newConfig);
            }
        }
        
        // Remove configurations that are no longer in the list
        List<String> newFieldKeys = configurations.stream()
            .map(FormFieldConfig::getFieldKey)
            .toList();
        
        List<FormFieldConfig> toDelete = existingConfigs.stream()
            .filter(existing -> !newFieldKeys.contains(existing.getFieldKey()))
            .toList();
        
        if (!toDelete.isEmpty()) {
            formFieldConfigRepository.deleteAll(toDelete);
        }
        
        // Return updated configurations
        return formFieldConfigRepository.findByFormType(tenantId, formType);
    }
    
    /**
     * Initialize default field configurations for patient form.
     */
    @Transactional
    public void initializeDefaultPatientFormConfig() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Initializing default patient form configuration for tenant: {}", tenantId);
        
        // Check if configurations already exist
        if (formFieldConfigRepository.existsByTenantIdAndFormTypeAndFieldKey(tenantId, "PATIENT", "firstName")) {
            log.info("Patient form configuration already exists for tenant: {}", tenantId);
            return;
        }
        
        initializeDefaultPatientFormConfigInternal(tenantId);
    }
    
    /**
     * Force reinitialize default field configurations for patient form (admin only).
     */
    @Transactional
    public void forceReinitializeDefaultPatientFormConfig() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Force reinitializing default patient form configuration for tenant: {}", tenantId);
        
        // Delete existing configurations for this form type
        List<FormFieldConfig> existingConfigs = formFieldConfigRepository.findByFormType(tenantId, "PATIENT");
        if (!existingConfigs.isEmpty()) {
            formFieldConfigRepository.deleteAll(existingConfigs);
            log.info("Deleted {} existing patient form configurations", existingConfigs.size());
        }
        
        initializeDefaultPatientFormConfigInternal(tenantId);
    }
    
    /**
     * Internal method to initialize default patient form configuration.
     */
    private void initializeDefaultPatientFormConfigInternal(String tenantId) {
        List<FormFieldConfig> defaultConfigs = List.of(
            // Personal Information Section
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("medicalRecordNumber")
                .fieldLabel("Medical Record Number")
                .fieldType("text")
                .section("personal_info")
                .isEnabled(true)
                .isRequired(false) // Auto-generated if not supplied
                .displayOrder(1)
                .fieldOptions("{\"autoGenerate\":true,\"placeholder\":\"Leave blank to auto-generate\"}")
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("firstName")
                .fieldLabel("First Name")
                .fieldType("text")
                .section("personal_info")
                .isEnabled(true)
                .isRequired(true)
                .displayOrder(2)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("lastName")
                .fieldLabel("Last Name")
                .fieldType("text")
                .section("personal_info")
                .isEnabled(true)
                .isRequired(true)
                .displayOrder(3)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("middleName")
                .fieldLabel("Middle Name")
                .fieldType("text")
                .section("personal_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(4)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("dateOfBirth")
                .fieldLabel("Date of Birth")
                .fieldType("date")
                .section("personal_info")
                .isEnabled(true)
                .isRequired(true)
                .displayOrder(5)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("gender")
                .fieldLabel("Gender")
                .fieldType("select")
                .section("personal_info")
                .isEnabled(true)
                .isRequired(true)
                .displayOrder(6)
                .fieldOptions("{\"options\":[{\"value\":\"MALE\",\"label\":\"Male\"},{\"value\":\"FEMALE\",\"label\":\"Female\"},{\"value\":\"OTHER\",\"label\":\"Other\"},{\"value\":\"PREFER_NOT_TO_SAY\",\"label\":\"Prefer not to say\"}]}")
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("maritalStatus")
                .fieldLabel("Marital Status")
                .fieldType("select")
                .section("personal_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(7)
                .fieldOptions("{\"options\":[{\"value\":\"SINGLE\",\"label\":\"Single\"},{\"value\":\"MARRIED\",\"label\":\"Married\"},{\"value\":\"DIVORCED\",\"label\":\"Divorced\"},{\"value\":\"WIDOWED\",\"label\":\"Widowed\"}]}")
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("nationalId")
                .fieldLabel("National ID/Passport")
                .fieldType("text")
                .section("personal_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(8)
                .createdBy("system")
                .build(),
                
            // Contact Information Section
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("phone")
                .fieldLabel("Primary Phone")
                .fieldType("tel")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(true)
                .displayOrder(8)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("alternatePhone")
                .fieldLabel("Alternate Phone")
                .fieldType("tel")
                .section("contact_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(9)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("email")
                .fieldLabel("Email Address")
                .fieldType("email")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(10)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("address")
                .fieldLabel("Address")
                .fieldType("textarea")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(11)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("city")
                .fieldLabel("City")
                .fieldType("text")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(12)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("state")
                .fieldLabel("State/Province")
                .fieldType("text")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(13)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("postalCode")
                .fieldLabel("Postal Code")
                .fieldType("text")
                .section("contact_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(14)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("country")
                .fieldLabel("Country")
                .fieldType("text")
                .section("contact_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(15)
                .createdBy("system")
                .build(),
                
            // Emergency Contact Section
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("emergencyContactName")
                .fieldLabel("Emergency Contact Name")
                .fieldType("text")
                .section("emergency_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(16)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("emergencyContactPhone")
                .fieldLabel("Emergency Contact Phone")
                .fieldType("tel")
                .section("emergency_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(17)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("emergencyContactRelationship")
                .fieldLabel("Emergency Contact Relationship")
                .fieldType("select")
                .section("emergency_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(18)
                .fieldOptions("{\"options\":[{\"value\":\"SPOUSE\",\"label\":\"Spouse\"},{\"value\":\"PARENT\",\"label\":\"Parent\"},{\"value\":\"CHILD\",\"label\":\"Child\"},{\"value\":\"SIBLING\",\"label\":\"Sibling\"},{\"value\":\"FRIEND\",\"label\":\"Friend\"},{\"value\":\"OTHER\",\"label\":\"Other\"}]}")
                .createdBy("system")
                .build(),
                
            // Medical Information Section
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("medicalRecordNumber")
                .fieldLabel("Medical Record Number")
                .fieldType("text")
                .section("medical_info")
                .isEnabled(true)
                .isRequired(false)
                .displayOrder(19)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("bloodType")
                .fieldLabel("Blood Type")
                .fieldType("select")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(20)
                .fieldOptions("{\"options\":[{\"value\":\"A+\",\"label\":\"A+\"},{\"value\":\"A-\",\"label\":\"A-\"},{\"value\":\"B+\",\"label\":\"B+\"},{\"value\":\"B-\",\"label\":\"B-\"},{\"value\":\"AB+\",\"label\":\"AB+\"},{\"value\":\"AB-\",\"label\":\"AB-\"},{\"value\":\"O+\",\"label\":\"O+\"},{\"value\":\"O-\",\"label\":\"O-\"}]}")
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("allergies")
                .fieldLabel("Known Allergies")
                .fieldType("textarea")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(21)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("medications")
                .fieldLabel("Current Medications")
                .fieldType("textarea")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(22)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("medicalHistory")
                .fieldLabel("Medical History")
                .fieldType("textarea")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(23)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("height")
                .fieldLabel("Height (cm)")
                .fieldType("number")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(24)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("weight")
                .fieldLabel("Weight (kg)")
                .fieldType("number")
                .section("medical_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(25)
                .createdBy("system")
                .build(),
                
            // Insurance Information Section
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("insuranceProvider")
                .fieldLabel("Insurance Provider")
                .fieldType("select")
                .section("insurance_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(26)
                .fieldOptions("{\"options\":[]}") // Will be populated dynamically
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("insurancePlan")
                .fieldLabel("Insurance Plan")
                .fieldType("select")
                .section("insurance_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(27)
                .fieldOptions("{\"options\":[]}") // Will be populated dynamically based on provider
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("insuranceNumber")
                .fieldLabel("Insurance Number")
                .fieldType("text")
                .section("insurance_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(28)
                .createdBy("system")
                .build(),
                
            FormFieldConfig.builder()
                .tenantId(tenantId)
                .formType("PATIENT")
                .fieldKey("insuranceExpiry")
                .fieldLabel("Insurance Expiry Date")
                .fieldType("date")
                .section("insurance_info")
                .isEnabled(false)
                .isRequired(false)
                .displayOrder(29)
                .createdBy("system")
                .build()
        );
        
        formFieldConfigRepository.saveAll(defaultConfigs);
        log.info("Initialized default patient form configuration for tenant: {}", tenantId);
    }
}
