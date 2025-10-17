package com.afyaquik.hms.forms.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Configuration for form fields that can be enabled/disabled by admin.
 */
@Entity
@Table(name = "form_field_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Column(name = "form_type", nullable = false)
    private String formType; // PATIENT, BILLING, etc.
    
    @Column(name = "field_key", nullable = false)
    private String fieldKey; // firstName, lastName, email, etc.
    
    @Column(name = "field_label")
    private String fieldLabel; // Display name for the field
    
    @Column(name = "field_type")
    private String fieldType; // text, email, phone, date, select, etc.
    
    @Column(name = "section")
    private String section; // personal_info, contact_info, medical_info, etc.
    
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules; // JSON string for validation rules
    
    @Column(name = "field_options", columnDefinition = "TEXT")
    private String fieldOptions; // JSON string for select options
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by", nullable = false)
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
