package com.afyaquik.hms.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.pharmacy.api.QueuePrescriptionController.CreateQueuePrescriptionRequest;
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.domain.PrescriptionItem;
import com.afyaquik.hms.pharmacy.dto.PrescriptionDto;
import com.afyaquik.hms.pharmacy.dto.PrescriptionItemDto;
import com.afyaquik.hms.pharmacy.repository.MedicationRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionItemRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionRepository;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;

@Service
@Transactional(readOnly = true)
public class QueuePrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionItemRepository prescriptionItemRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private VisitQueueItemRepository visitQueueItemRepository;

    // @Autowired
    // private PrescriptionMapper prescriptionMapper;

    public List<PrescriptionDto> getPrescriptionsByQueueItem(String tenantId, Long queueItemId) {
        // Get the queue item to find the patient
        var queueItem = visitQueueItemRepository.findById(queueItemId)
            .orElseThrow(() -> new RuntimeException("Queue item not found"));
        
        if (!queueItem.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to queue item in another tenant");
        }

        // Get prescriptions for this patient
        List<Prescription> prescriptions = prescriptionRepository.findByTenantIdAndPatientId(
            tenantId, queueItem.getPatient().getId());
        
        return prescriptions.stream()
            .map(prescription -> convertToDto(tenantId, prescription))
            .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionDto createPrescriptionForQueueItem(String tenantId, Long queueItemId, CreateQueuePrescriptionRequest request) {
        // Validate queue item exists and belongs to tenant
        var queueItem = visitQueueItemRepository.findById(queueItemId)
            .orElseThrow(() -> new RuntimeException("Queue item not found"));
        
        if (!queueItem.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to queue item in another tenant");
        }

        // Validate patient exists
        var patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        if (!patient.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to patient in another tenant");
        }

        // Validate prescribed by user exists
        var prescribedBy = staffUserRepository.findById(request.getPrescribedById())
            .orElseThrow(() -> new RuntimeException("Prescribing user not found"));
        
        if (!prescribedBy.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to user in another tenant");
        }

        // Create prescription
        Prescription prescription = new Prescription();
        prescription.setTenantId(tenantId);
        prescription.setPrescriptionNumber("RX-" + System.currentTimeMillis());
        prescription.setPatient(patient);
        prescription.setPrescribedBy(prescribedBy);
        prescription.setPrescriptionDate(LocalDateTime.now());
        prescription.setStatus(Prescription.PrescriptionStatus.PENDING);
        prescription.setNotes(request.getNotes());

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Create prescription items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (var itemRequest : request.getItems()) {
            var medication = medicationRepository.findById(itemRequest.getMedicationId())
                .orElseThrow(() -> new RuntimeException("Medication not found"));

            PrescriptionItem item = new PrescriptionItem();
            item.setTenantId(tenantId);
            item.setPrescription(savedPrescription);
            item.setMedication(medication);
            item.setQuantityPrescribed(itemRequest.getQuantityPrescribed());
            item.setDosageInstructions(itemRequest.getDosageInstructions());
            item.setFrequency(itemRequest.getFrequency());
            item.setDurationDays(itemRequest.getDurationDays());
            item.setUnitPrice(itemRequest.getUnitPrice() != null ? BigDecimal.valueOf(itemRequest.getUnitPrice()) : medication.getUnitPrice());
            item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantityPrescribed())));
            item.setNotes(itemRequest.getNotes());
            // item.setFullyDispensed(false);
            // item.setRemainingQuantity(item.getQuantityPrescribed());

            prescriptionItemRepository.save(item);
            totalAmount = totalAmount.add(item.getTotalPrice());
        }

        // Update prescription total
        savedPrescription.setTotalAmount(totalAmount);
        prescriptionRepository.save(savedPrescription);

        return convertToDto(tenantId, savedPrescription);
    }

    private PrescriptionDto convertToDto(String tenantId, Prescription prescription) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(prescription.getId());
        dto.setPrescriptionNumber(prescription.getPrescriptionNumber());
        dto.setPatientId(prescription.getPatient().getId());
        dto.setPatientName(prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName());
        dto.setPatientMrn(prescription.getPatient().getMedicalRecordNumber());
        dto.setPrescribedById(prescription.getPrescribedBy().getId());
        dto.setPrescribedByName(prescription.getPrescribedBy().getDisplayName());
        dto.setPrescriptionDate(prescription.getPrescriptionDate());
        dto.setStatus(prescription.getStatus());
        dto.setNotes(prescription.getNotes());
        dto.setTotalAmount(prescription.getTotalAmount());
        dto.setDispensedBy(prescription.getDispensedBy());
        dto.setDispensedByName(prescription.getDispensedBy() != null ? "Dispensed User" : null); // TODO: Get actual dispensed by name
        dto.setDispensedAt(prescription.getDispensedAt());
        dto.setDispensingNotes(prescription.getDispensingNotes());
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());
        
        // Convert prescription items
        List<PrescriptionItem> items = prescriptionItemRepository.findByTenantIdAndPrescriptionId(tenantId, prescription.getId());
        List<PrescriptionItemDto> itemDtos = items.stream()
            .map(this::convertItemToDto)
            .collect(Collectors.toList());
        dto.setItems(itemDtos);
        
        return dto;
    }

    private PrescriptionItemDto convertItemToDto(PrescriptionItem item) {
        PrescriptionItemDto dto = new PrescriptionItemDto();
        dto.setId(item.getId());
        dto.setPrescriptionId(item.getPrescription().getId());
        dto.setMedicationId(item.getMedication().getId());
        dto.setMedicationName(item.getMedication().getName());
        dto.setMedicationCode(item.getMedication().getMedicationCode());
        dto.setQuantityPrescribed(item.getQuantityPrescribed());
        dto.setQuantityDispensed(item.getQuantityDispensed());
        dto.setDosageInstructions(item.getDosageInstructions());
        dto.setFrequency(item.getFrequency());
        dto.setDurationDays(item.getDurationDays());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setNotes(item.getNotes());
        dto.setFullyDispensed(item.isFullyDispensed());
        dto.setRemainingQuantity(item.getRemainingQuantity());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }
}
