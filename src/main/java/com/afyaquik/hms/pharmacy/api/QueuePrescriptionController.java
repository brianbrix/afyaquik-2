package com.afyaquik.hms.pharmacy.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.dto.PrescriptionDto;
import com.afyaquik.hms.pharmacy.service.QueuePrescriptionService;

@RestController
@RequestMapping("/api/v1/pharmacy/queue-prescriptions")
public class QueuePrescriptionController {

    @Autowired
    private QueuePrescriptionService queuePrescriptionService;

    @GetMapping("/queue-item/{queueItemId}")
    public ApiResponse<List<PrescriptionDto>> getPrescriptionsByQueueItem(@PathVariable Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queuePrescriptionService.getPrescriptionsByQueueItem(tenantId, queueItemId));
    }

    @PostMapping("/queue-item/{queueItemId}/prescription")
    public ResponseEntity<ApiResponse<PrescriptionDto>> createPrescriptionForQueueItem(
            @PathVariable Long queueItemId,
            @RequestBody CreateQueuePrescriptionRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionDto response = queuePrescriptionService.createPrescriptionForQueueItem(tenantId, queueItemId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Request DTO for creating prescriptions from queue items
    public static class CreateQueuePrescriptionRequest {
        private Long patientId;
        private Long prescribedById;
        private String notes;
        private List<PrescriptionItemRequest> items;

        // Getters and setters
        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }
        
        public Long getPrescribedById() { return prescribedById; }
        public void setPrescribedById(Long prescribedById) { this.prescribedById = prescribedById; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public List<PrescriptionItemRequest> getItems() { return items; }
        public void setItems(List<PrescriptionItemRequest> items) { this.items = items; }
    }

    public static class PrescriptionItemRequest {
        private Long medicationId;
        private Integer quantityPrescribed;
        private String dosageInstructions;
        private String frequency;
        private Integer durationDays;
        private Double unitPrice;
        private String notes;

        // Getters and setters
        public Long getMedicationId() { return medicationId; }
        public void setMedicationId(Long medicationId) { this.medicationId = medicationId; }
        
        public Integer getQuantityPrescribed() { return quantityPrescribed; }
        public void setQuantityPrescribed(Integer quantityPrescribed) { this.quantityPrescribed = quantityPrescribed; }
        
        public String getDosageInstructions() { return dosageInstructions; }
        public void setDosageInstructions(String dosageInstructions) { this.dosageInstructions = dosageInstructions; }
        
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        
        public Integer getDurationDays() { return durationDays; }
        public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
        
        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}

