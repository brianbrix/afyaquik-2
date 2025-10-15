package com.afyaquik.hms.pharmacy.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.domain.PrescriptionAudit;
import com.afyaquik.hms.pharmacy.repository.PrescriptionAuditRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class PrescriptionAuditService {

    @Autowired
    private PrescriptionAuditRepository prescriptionAuditRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create an audit entry for a prescription action
     */
    public void createAuditEntry(Prescription prescription, 
                                PrescriptionAudit.ActionType actionType,
                                Prescription.PrescriptionStatus previousStatus,
                                Prescription.PrescriptionStatus newStatus,
                                String reason,
                                String changesSummary) {
        try {
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            
            PrescriptionAudit audit = new PrescriptionAudit();
            audit.setTenantId(tenantId);
            audit.setPrescription(prescription);
            audit.setActionType(actionType);
            audit.setPreviousStatus(previousStatus);
            audit.setNewStatus(newStatus);
            audit.setActionBy(getCurrentUser());
            audit.setActionAt(LocalDateTime.now());
            audit.setReason(reason);
            audit.setChangesSummary(changesSummary);
            
            // Create JSON snapshot of prescription data
            try {
                String prescriptionJson = objectMapper.writeValueAsString(createPrescriptionSnapshot(prescription));
                audit.setPrescriptionData(prescriptionJson);
            } catch (Exception e) {
                audit.setPrescriptionData("Error serializing prescription data: " + e.getMessage());
            }
            
            prescriptionAuditRepository.save(audit);
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to create audit entry: " + e.getMessage());
        }
    }

    /**
     * Get audit trail for a prescription
     */
    @Transactional(readOnly = true)
    public List<PrescriptionAudit> getAuditTrail(String tenantId, Long prescriptionId) {
        return prescriptionAuditRepository.findByTenantIdAndPrescriptionIdOrderByCreatedAtDesc(tenantId, prescriptionId);
    }

    /**
     * Get audit entries by action type
     */
    @Transactional(readOnly = true)
    public List<PrescriptionAudit> getAuditByActionType(String tenantId, PrescriptionAudit.ActionType actionType) {
        return prescriptionAuditRepository.findByTenantIdAndActionTypeOrderByCreatedAtDesc(tenantId, actionType);
    }

    /**
     * Get audit entries for a specific user
     */
    @Transactional(readOnly = true)
    public List<PrescriptionAudit> getAuditByUser(String tenantId, String actionBy) {
        return prescriptionAuditRepository.findByTenantIdAndActionByOrderByCreatedAtDesc(tenantId, actionBy);
    }

    /**
     * Get latest audit entry for a prescription
     */
    @Transactional(readOnly = true)
    public PrescriptionAudit getLatestAuditEntry(String tenantId, Long prescriptionId) {
        List<PrescriptionAudit> entries = prescriptionAuditRepository.findLatestByPrescription(tenantId, prescriptionId);
        return entries.isEmpty() ? null : entries.get(0);
    }

    /**
     * Get audit entries within a date range
     */
    @Transactional(readOnly = true)
    public List<PrescriptionAudit> getAuditByDateRange(String tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return prescriptionAuditRepository.findByDateRange(tenantId, startDate, endDate);
    }

    /**
     * Create a snapshot of prescription data for audit purposes
     */
    private PrescriptionSnapshot createPrescriptionSnapshot(Prescription prescription) {
        PrescriptionSnapshot snapshot = new PrescriptionSnapshot();
        snapshot.setId(prescription.getId());
        snapshot.setPrescriptionNumber(prescription.getPrescriptionNumber());
        snapshot.setPatientId(prescription.getPatient().getId());
        snapshot.setPrescribedById(prescription.getPrescribedBy().getId());
        snapshot.setPrescriptionDate(prescription.getPrescriptionDate());
        snapshot.setStatus(prescription.getStatus());
        snapshot.setNotes(prescription.getNotes());
        snapshot.setTotalAmount(prescription.getTotalAmount());
        snapshot.setDispensedBy(prescription.getDispensedBy());
        snapshot.setDispensedAt(prescription.getDispensedAt());
        snapshot.setDispensingNotes(prescription.getDispensingNotes());
        snapshot.setQueueItemId(prescription.getQueueItemId());
        snapshot.setVersion(prescription.getVersion());
        return snapshot;
    }

    /**
     * Get current user from security context
     */
    private String getCurrentUser() {
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // Log the exception if needed, but don't fail the operation
        }
        return "system";
    }

    /**
     * Snapshot class for prescription data
     */
    public static class PrescriptionSnapshot {
        private Long id;
        private String prescriptionNumber;
        private Long patientId;
        private Long prescribedById;
        private java.time.LocalDateTime prescriptionDate;
        private Prescription.PrescriptionStatus status;
        private String notes;
        private java.math.BigDecimal totalAmount;
        private Long dispensedBy;
        private java.time.LocalDateTime dispensedAt;
        private String dispensingNotes;
        private Long queueItemId;
        private Long version;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getPrescriptionNumber() { return prescriptionNumber; }
        public void setPrescriptionNumber(String prescriptionNumber) { this.prescriptionNumber = prescriptionNumber; }
        
        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }
        
        public Long getPrescribedById() { return prescribedById; }
        public void setPrescribedById(Long prescribedById) { this.prescribedById = prescribedById; }
        
        public java.time.LocalDateTime getPrescriptionDate() { return prescriptionDate; }
        public void setPrescriptionDate(java.time.LocalDateTime prescriptionDate) { this.prescriptionDate = prescriptionDate; }
        
        public Prescription.PrescriptionStatus getStatus() { return status; }
        public void setStatus(Prescription.PrescriptionStatus status) { this.status = status; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public java.math.BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public Long getDispensedBy() { return dispensedBy; }
        public void setDispensedBy(Long dispensedBy) { this.dispensedBy = dispensedBy; }
        
        public java.time.LocalDateTime getDispensedAt() { return dispensedAt; }
        public void setDispensedAt(java.time.LocalDateTime dispensedAt) { this.dispensedAt = dispensedAt; }
        
        public String getDispensingNotes() { return dispensingNotes; }
        public void setDispensingNotes(String dispensingNotes) { this.dispensingNotes = dispensingNotes; }
        
        public Long getQueueItemId() { return queueItemId; }
        public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }
        
        public Long getVersion() { return version; }
        public void setVersion(Long version) { this.version = version; }
    }
}
