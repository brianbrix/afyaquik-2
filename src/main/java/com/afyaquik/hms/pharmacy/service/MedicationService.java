package com.afyaquik.hms.pharmacy.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.pharmacy.dto.MedicationDto;
import com.afyaquik.hms.pharmacy.dto.MedicationRequest;
import com.afyaquik.hms.pharmacy.repository.MedicationRepository;

@Service
@Transactional
public class MedicationService {

    private final MedicationRepository medicationRepository;

    public MedicationService(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    public MedicationDto create(String tenantId, MedicationRequest request) {
        // Check if medication code already exists
        if (medicationRepository.findByTenantIdAndMedicationCode(tenantId, request.getMedicationCode()).isPresent()) {
            throw new IllegalStateException("Medication with code " + request.getMedicationCode() + " already exists");
        }

        Medication medication = new Medication();
        mapRequestToEntity(request, medication);
        medication.setTenantId(tenantId);

        Medication saved = medicationRepository.save(medication);
        return mapEntityToDto(saved);
    }

    public MedicationDto update(String tenantId, Long id, MedicationRequest request) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Medication not found"));

        if (!medication.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Medication not found");
        }

        // Check if medication code already exists (excluding current medication)
        if (!medication.getMedicationCode().equals(request.getMedicationCode()) &&
            medicationRepository.countByTenantIdAndMedicationCodeExcludingId(tenantId, request.getMedicationCode(), id) > 0) {
            throw new IllegalStateException("Medication with code " + request.getMedicationCode() + " already exists");
        }

        mapRequestToEntity(request, medication);
        Medication saved = medicationRepository.save(medication);
        return mapEntityToDto(saved);
    }

    @Transactional(readOnly = true)
    public MedicationDto getById(String tenantId, Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Medication not found"));

        if (!medication.getTenantId().equals(tenantId) || medication.isDeleted()) {
            throw new IllegalStateException("Medication not found");
        }

        return mapEntityToDto(medication);
    }

    @Transactional(readOnly = true)
    public MedicationDto getByCode(String tenantId, String medicationCode) {
        Medication medication = medicationRepository.findByTenantIdAndMedicationCode(tenantId, medicationCode)
                .orElseThrow(() -> new IllegalStateException("Medication not found"));

        return mapEntityToDto(medication);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getAll(String tenantId) {
        return medicationRepository.findByTenantIdAndNotDeleted(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicationDto> getAll(String tenantId, Pageable pageable) {
        return medicationRepository.findByTenantIdAndNotDeleted(tenantId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getActive(String tenantId) {
        return medicationRepository.findActiveByTenantId(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicationDto> getActive(String tenantId, Pageable pageable) {
        return medicationRepository.findActiveByTenantId(tenantId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> search(String tenantId, String searchTerm) {
        return medicationRepository.searchByTenantId(tenantId, searchTerm)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicationDto> search(String tenantId, String searchTerm, Pageable pageable) {
        return medicationRepository.searchByTenantId(tenantId, searchTerm, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getControlledSubstances(String tenantId) {
        return medicationRepository.findControlledSubstancesByTenantId(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getByPrescriptionRequirement(String tenantId, boolean requiresPrescription) {
        return medicationRepository.findByTenantIdAndRequiresPrescription(tenantId, requiresPrescription)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    public void delete(String tenantId, Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Medication not found"));

        if (!medication.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Medication not found");
        }

        medication.softDelete();
        medicationRepository.save(medication);
    }

    private void mapRequestToEntity(MedicationRequest request, Medication medication) {
        medication.setMedicationCode(request.getMedicationCode());
        medication.setName(request.getName());
        medication.setGenericName(request.getGenericName());
        medication.setManufacturer(request.getManufacturer());
        medication.setDosageForm(request.getDosageForm());
        medication.setStrength(request.getStrength());
        medication.setUnitOfMeasure(request.getUnitOfMeasure());
        medication.setDescription(request.getDescription());
        medication.setUnitPrice(request.getUnitPrice());
        medication.setControlledSubstance(request.getControlledSubstance());
        medication.setRequiresPrescription(request.getRequiresPrescription());
        medication.setActive(request.getActive());
    }

    private MedicationDto mapEntityToDto(Medication medication) {
        return new MedicationDto(
                medication.getId(),
                medication.getMedicationCode(),
                medication.getName(),
                medication.getGenericName(),
                medication.getManufacturer(),
                medication.getDosageForm(),
                medication.getStrength(),
                medication.getUnitOfMeasure(),
                medication.getDescription(),
                medication.getUnitPrice(),
                medication.isControlledSubstance(),
                medication.isRequiresPrescription(),
                medication.isActive(),
                medication.getCreatedAt(),
                medication.getUpdatedAt()
        );
    }
}

