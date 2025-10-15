package com.afyaquik.hms.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.domain.PrescriptionItem;
import com.afyaquik.hms.pharmacy.dto.PrescriptionDto;
import com.afyaquik.hms.pharmacy.dto.PrescriptionItemDto;
import com.afyaquik.hms.pharmacy.dto.PrescriptionRequest;
import com.afyaquik.hms.pharmacy.repository.MedicationRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionItemRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionRepository;

@Service
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final StaffUserRepository staffUserRepository;
    private final PrescriptionBillingService prescriptionBillingService;
    private final StockManagementService stockManagementService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                              PrescriptionItemRepository prescriptionItemRepository,
                              MedicationRepository medicationRepository,
                              PatientRepository patientRepository,
                              StaffUserRepository staffUserRepository,
                              PrescriptionBillingService prescriptionBillingService,
                              StockManagementService stockManagementService) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicationRepository = medicationRepository;
        this.patientRepository = patientRepository;
        this.staffUserRepository = staffUserRepository;
        this.prescriptionBillingService = prescriptionBillingService;
        this.stockManagementService = stockManagementService;
    }

    public PrescriptionDto create(String tenantId, PrescriptionRequest request) {
        // Check if prescription number already exists
        if (prescriptionRepository.findByTenantIdAndPrescriptionNumber(tenantId, request.getPrescriptionNumber()).isPresent()) {
            throw new IllegalStateException("Prescription with number " + request.getPrescriptionNumber() + " already exists");
        }

        // Validate patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalStateException("Patient not found"));

        if (!patient.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Patient not found");
        }

        // Validate prescribed by user exists
        StaffUser prescribedBy = staffUserRepository.findById(request.getPrescribedById())
                .orElseThrow(() -> new IllegalStateException("Prescribing user not found"));

        if (!prescribedBy.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Prescribing user not found");
        }

        // Create prescription
        Prescription prescription = new Prescription();
        prescription.setTenantId(tenantId);
        prescription.setPrescriptionNumber(request.getPrescriptionNumber());
        prescription.setPatient(patient);
        prescription.setPrescribedBy(prescribedBy);
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setStatus(Prescription.PrescriptionStatus.PENDING);
        prescription.setNotes(request.getNotes());

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Create prescription items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (var itemRequest : request.getItems()) {
            Medication medication = medicationRepository.findById(itemRequest.getMedicationId())
                    .orElseThrow(() -> new IllegalStateException("Medication not found: " + itemRequest.getMedicationId()));

            if (!medication.getTenantId().equals(tenantId)) {
                throw new IllegalStateException("Medication not found: " + itemRequest.getMedicationId());
            }

            PrescriptionItem item = new PrescriptionItem();
            item.setTenantId(tenantId);
            item.setPrescription(savedPrescription);
            item.setMedication(medication);
            item.setQuantityPrescribed(itemRequest.getQuantityPrescribed());
            item.setQuantityDispensed(0);
            item.setDosageInstructions(itemRequest.getDosageInstructions());
            item.setFrequency(itemRequest.getFrequency());
            item.setDurationDays(itemRequest.getDurationDays());
            item.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : medication.getUnitPrice());
            item.setNotes(itemRequest.getNotes());

            // Calculate total price for this item
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantityPrescribed()));
            item.setTotalPrice(itemTotal);
            totalAmount = totalAmount.add(itemTotal);

            prescriptionItemRepository.save(item);
        }

        // Update prescription total amount
        savedPrescription.setTotalAmount(totalAmount);
        prescriptionRepository.save(savedPrescription);

        return mapEntityToDto(savedPrescription);
    }

    @Transactional
    public PrescriptionDto update(String tenantId, Long id, PrescriptionRequest request) {
        // Find existing prescription
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        if (!prescription.getTenantId().equals(tenantId) || prescription.isDeleted()) {
            throw new IllegalStateException("Prescription not found");
        }

        // Update prescription details
        prescription.setNotes(request.getNotes());

        // Delete existing prescription items
        List<PrescriptionItem> existingItems = prescriptionItemRepository.findByTenantIdAndPrescriptionId(tenantId, id);
        for (PrescriptionItem item : existingItems) {
            prescriptionItemRepository.delete(item);
        }

        // Create new prescription items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (var itemRequest : request.getItems()) {
            var medication = medicationRepository.findById(itemRequest.getMedicationId())
                    .orElseThrow(() -> new IllegalStateException("Medication not found"));

            PrescriptionItem item = new PrescriptionItem();
            item.setTenantId(tenantId);
            item.setPrescription(prescription);
            item.setMedication(medication);
            item.setQuantityPrescribed(itemRequest.getQuantityPrescribed());
            item.setDosageInstructions(itemRequest.getDosageInstructions());
            item.setFrequency(itemRequest.getFrequency());
            item.setDurationDays(itemRequest.getDurationDays());
            item.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : medication.getUnitPrice());
            item.setNotes(itemRequest.getNotes());

            // Calculate total price for this item
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantityPrescribed()));
            item.setTotalPrice(itemTotal);
            totalAmount = totalAmount.add(itemTotal);

            prescriptionItemRepository.save(item);
        }

        // Update prescription total amount
        prescription.setTotalAmount(totalAmount);
        prescriptionRepository.save(prescription);

        return mapEntityToDto(prescription);
    }

    @Transactional(readOnly = true)
    public PrescriptionDto getById(String tenantId, Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        if (!prescription.getTenantId().equals(tenantId) || prescription.isDeleted()) {
            throw new IllegalStateException("Prescription not found");
        }

        return mapEntityToDto(prescription);
    }

    @Transactional(readOnly = true)
    public PrescriptionDto getByNumber(String tenantId, String prescriptionNumber) {
        Prescription prescription = prescriptionRepository.findByTenantIdAndPrescriptionNumber(tenantId, prescriptionNumber)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        return mapEntityToDto(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionDto> getByPatient(String tenantId, Long patientId) {
        return prescriptionRepository.findByTenantIdAndPatientId(tenantId, patientId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDto> getByPatient(String tenantId, Long patientId, Pageable pageable) {
        return prescriptionRepository.findByTenantIdAndPatientId(tenantId, patientId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionDto> getByStatus(String tenantId, Prescription.PrescriptionStatus status) {
        return prescriptionRepository.findByTenantIdAndStatus(tenantId, status)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDto> getByStatus(String tenantId, Prescription.PrescriptionStatus status, Pageable pageable) {
        return prescriptionRepository.findByTenantIdAndStatus(tenantId, status, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionDto> getAll(String tenantId) {
        return prescriptionRepository.findByTenantIdAndNotDeleted(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDto> getAll(String tenantId, Pageable pageable) {
        return prescriptionRepository.findByTenantIdAndNotDeleted(tenantId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionDto> search(String tenantId, String searchTerm) {
        return prescriptionRepository.searchByTenantId(tenantId, searchTerm)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDto> search(String tenantId, String searchTerm, Pageable pageable) {
        return prescriptionRepository.searchByTenantId(tenantId, searchTerm, pageable)
                .map(this::mapEntityToDto);
    }

    public PrescriptionDto dispense(String tenantId, Long id, Long dispensedBy, String dispensingNotes) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        if (!prescription.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Prescription not found");
        }

        if (prescription.getStatus() != Prescription.PrescriptionStatus.PENDING) {
            throw new IllegalStateException("Only pending prescriptions can be dispensed");
        }

        // Validate dispensed by user exists
        StaffUser dispensedByUser = staffUserRepository.findById(dispensedBy)
                .orElseThrow(() -> new IllegalStateException("Dispensing user not found"));

        if (!dispensedByUser.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Dispensing user not found");
        }

        prescription.setStatus(Prescription.PrescriptionStatus.DISPENSED);
        prescription.setDispensedBy(dispensedBy);
        prescription.setDispensedAt(LocalDateTime.now());
        prescription.setDispensingNotes(dispensingNotes);

        // Check stock availability before dispensing
        if (!stockManagementService.checkPrescriptionStockAvailability(tenantId, id)) {
            throw new IllegalStateException("Insufficient stock to dispense this prescription");
        }

        // Mark all items as fully dispensed
        List<PrescriptionItem> items = prescriptionItemRepository.findByTenantIdAndPrescriptionId(tenantId, id);
        for (PrescriptionItem item : items) {
            item.setQuantityDispensed(item.getQuantityPrescribed());
            prescriptionItemRepository.save(item);
        }

        // Deduct stock from inventory using batch-aware deduction
        for (PrescriptionItem item : items) {
            stockManagementService.deductStockFromBatches(tenantId, item.getMedication().getId(), 
                item.getQuantityDispensed(), 
                "Dispensed for prescription #" + prescription.getPrescriptionNumber());
        }

        Prescription saved = prescriptionRepository.save(prescription);
        
        // Add prescription items to bill
        try {
            // Get queue item ID from prescription
            Long queueItemId = prescription.getQueueItemId();
            if (queueItemId != null) {
                prescriptionBillingService.addPrescriptionToBill(id, queueItemId, prescription.getPatient().getId(), 
                    prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName());
            } else {
                // Log warning if no queue item ID is available
                System.err.println("Warning: No queue item ID found for prescription " + prescription.getPrescriptionNumber() + 
                    ". Billing integration skipped.");
            }
        } catch (Exception e) {
            // Log error but don't fail the dispense operation
            System.err.println("Failed to add prescription to bill: " + e.getMessage());
        }
        
        return mapEntityToDto(saved);
    }

    public PrescriptionDto cancel(String tenantId, Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        if (!prescription.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Prescription not found");
        }

        if (prescription.getStatus() != Prescription.PrescriptionStatus.PENDING) {
            throw new IllegalStateException("Only pending prescriptions can be cancelled");
        }

        // If prescription was already dispensed, restore stock
        if (prescription.getStatus() == Prescription.PrescriptionStatus.DISPENSED) {
            stockManagementService.restoreStockForPrescription(tenantId, id);
        }

        prescription.setStatus(Prescription.PrescriptionStatus.CANCELLED);
        Prescription saved = prescriptionRepository.save(prescription);
        return mapEntityToDto(saved);
    }

    public void delete(String tenantId, Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Prescription not found"));

        if (!prescription.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Prescription not found");
        }

        prescription.softDelete();
        prescriptionRepository.save(prescription);
    }

    private PrescriptionDto mapEntityToDto(Prescription prescription) {
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
        dto.setDispensedAt(prescription.getDispensedAt());
        dto.setDispensingNotes(prescription.getDispensingNotes());
        dto.setQueueItemId(prescription.getQueueItemId());
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());

        // Load prescription items
        List<PrescriptionItem> items = prescriptionItemRepository.findByTenantIdAndPrescriptionId(prescription.getTenantId(), prescription.getId());
        List<PrescriptionItemDto> itemDtos = items.stream()
                .map(this::mapItemEntityToDto)
                .collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }

    private PrescriptionItemDto mapItemEntityToDto(PrescriptionItem item) {
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

