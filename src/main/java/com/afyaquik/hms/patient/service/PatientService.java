package com.afyaquik.hms.patient.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.patient.api.CreatePatientRequest;
import com.afyaquik.hms.patient.api.PatientResponse;
import com.afyaquik.hms.patient.api.UpdatePatientRequest;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.dto.PatientSummary;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    @Transactional
    public PatientResponse update(String tenantId, Long id, UpdatePatientRequest request) {
        log.info("Updating patient tenant={} id={}", tenantId, id);
        log.debug("Update request: firstName={}, lastName={}, medicalRecordNumber={}", 
                request.firstName(), request.lastName(), request.medicalRecordNumber());
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Patient not found for update tenant={} id={}", tenantId, id);
                    return new EntityNotFoundException("Patient not found");
                });
        if (!patient.getTenantId().equals(tenantId)) {
            log.warn("Tenant mismatch for update tenant={} id={}", tenantId, id);
            throw new IllegalStateException("Tenant mismatch");
        }
        
        log.debug("Before update: firstName={}, lastName={}, medicalRecordNumber={}", 
                patient.getFirstName(), patient.getLastName(), patient.getMedicalRecordNumber());
        
        // Update all fields - frontend sends all fields in update requests
        patient.setMedicalRecordNumber(request.medicalRecordNumber());
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setNationalId(request.nationalId());
        patient.setGender(request.gender());
        
        // Set additional fields (allow null values to clear fields)
        patient.setMiddleName(request.middleName());
        patient.setAlternatePhone(request.alternatePhone());
        patient.setAddress(request.address());
        patient.setCity(request.city());
        patient.setState(request.state());
        patient.setPostalCode(request.postalCode());
        patient.setCountry(request.country());
        patient.setEmergencyContactName(request.emergencyContactName());
        patient.setEmergencyContactPhone(request.emergencyContactPhone());
        patient.setEmergencyContactRelationship(request.emergencyContactRelationship());
        patient.setAllergies(request.allergies());
        patient.setMedications(request.medications());
        patient.setMedicalHistory(request.medicalHistory());
        patient.setNotes(request.notes());
        
        Patient saved = patientRepository.save(patient);
        log.debug("After update: firstName={}, lastName={}, medicalRecordNumber={}", 
                saved.getFirstName(), saved.getLastName(), saved.getMedicalRecordNumber());
        
        VisitQueueItem queueItem = queueRepository.findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, saved.getId()).orElse(null);
        log.info("Patient updated tenant={} id={}", tenantId, saved.getId());
        return toPatientResponse(saved, queueItem);
    }

    private final PatientRepository patientRepository;
    private final VisitQueueItemRepository queueRepository;

    public PatientService(PatientRepository patientRepository, VisitQueueItemRepository queueRepository) {
        this.patientRepository = patientRepository;
        this.queueRepository = queueRepository;
    }

    @Transactional
    public PatientResponse register(String tenantId, CreatePatientRequest request) {
        log.info("Registering patient tenant={} mrn={}", tenantId, request.medicalRecordNumber());
        patientRepository
                .findByTenantIdAndMedicalRecordNumber(tenantId, request.medicalRecordNumber())
                .ifPresent(existing -> {
                    log.warn("Patient with MRN already exists tenant={} mrn={}", tenantId, request.medicalRecordNumber());
                    throw new IllegalStateException("Patient with MRN already exists");
                });

        Patient patient = new Patient();
        patient.setTenantId(tenantId);
        patient.setMedicalRecordNumber(request.medicalRecordNumber());
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setNationalId(request.nationalId());
        patient.setGender(request.gender());
        
        // Set additional fields
        patient.setMiddleName(request.middleName());
        patient.setAlternatePhone(request.alternatePhone());
        patient.setAddress(request.address());
        patient.setCity(request.city());
        patient.setState(request.state());
        patient.setPostalCode(request.postalCode());
        patient.setCountry(request.country());
        patient.setEmergencyContactName(request.emergencyContactName());
        patient.setEmergencyContactPhone(request.emergencyContactPhone());
        patient.setEmergencyContactRelationship(request.emergencyContactRelationship());
        patient.setAllergies(request.allergies());
        patient.setMedications(request.medications());
        patient.setMedicalHistory(request.medicalHistory());
        patient.setNotes(request.notes());

        Patient saved = patientRepository.save(patient);

        QueuePriority priority = parsePriority(request.priority());
        VisitQueueItem queueItem = new VisitQueueItem();
        queueItem.setTenantId(tenantId);
        queueItem.setPatient(saved);
        queueItem.setTicketNumber(generateTicketNumber(tenantId, saved.getId()));
        queueItem.setVisitReason(request.visitReason());
        queueItem.setPriority(priority);
        queueItem.setCurrentStatus(QueueStatus.PENDING_CHECKIN);
        VisitQueueItem savedQueueItem = queueRepository.save(queueItem);

        log.info("Patient registered tenant={} id={} mrn={}", tenantId, saved.getId(), saved.getMedicalRecordNumber());
        return toPatientResponse(saved, savedQueueItem);
    }

    public PatientResponse getByMrn(String tenantId, String medicalRecordNumber) {
    log.info("Get patient by MRN tenant={} mrn={}", tenantId, medicalRecordNumber);
    Patient patient = patientRepository
        .findByTenantIdAndMedicalRecordNumber(tenantId, medicalRecordNumber)
        .orElseThrow(() -> {
            log.warn("Patient not found tenant={} mrn={}", tenantId, medicalRecordNumber);
            return new EntityNotFoundException("Patient not found");
        });

    VisitQueueItem queueItem = queueRepository
        .findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, patient.getId())
        .orElse(null);

    return toPatientResponse(patient, queueItem);
    }

    public List<PatientSummary> search(String tenantId, String query) {
        log.info("Searching patients tenant={} query='{}'", tenantId, query);
        String sanitizedQuery = query == null ? "" : query.trim();
        List<PatientSummary> results;
        if (sanitizedQuery.isBlank()) {
            Specification<Patient> spec = (root, cq, cb) -> {
                Predicate tenantPredicate = cb.equal(root.get("tenantId"), tenantId);
                Predicate notDeletedPredicate = cb.equal(root.get("deleted"), false);
                return cb.and(tenantPredicate, notDeletedPredicate);
            };
            results = patientRepository.findAll(spec).stream()
                .map(PatientService::toSummary)
                .collect(Collectors.toList());
        } else {
            Specification<Patient> spec = (root, cq, cb) -> {
                Predicate tenantPredicate = cb.equal(root.get("tenantId"), tenantId);
                Predicate notDeletedPredicate = cb.equal(root.get("deleted"), false);
                String likeQuery = "%" + sanitizedQuery.toLowerCase() + "%";
                Predicate orPredicate = cb.or(
                        cb.like(cb.lower(root.get("medicalRecordNumber")), likeQuery),
                        cb.like(cb.lower(root.get("firstName")), likeQuery),
                        cb.like(cb.lower(root.get("lastName")), likeQuery),
                        cb.like(cb.lower(root.get("phone")), likeQuery),
                        cb.like(cb.lower(root.get("email")), likeQuery)
                );
                return cb.and(tenantPredicate, notDeletedPredicate, orPredicate);
            };
            results = patientRepository.findAll(spec).stream()
                .map(PatientService::toSummary)
                .collect(Collectors.toList());
        }
        log.debug("Patient search found {} results for tenant={}", results.size(), tenantId);
        return results;
    }

    public Page<PatientSummary> searchPaged(String tenantId, String query, Pageable pageable) {
        log.info("Searching patients (paged) tenant={} query='{}' page={} size={}", tenantId, query, pageable.getPageNumber(), pageable.getPageSize());
        String sanitizedQuery = query == null ? "" : query.trim();
        
        // Debug: Check total patients in database
        long totalPatientsInDb = patientRepository.count();
        long totalPatientsForTenant = patientRepository.countByTenantId(tenantId);
        log.info("DEBUG: Total patients in DB: {}, Total for tenant {}: {}", totalPatientsInDb, tenantId, totalPatientsForTenant);
        
        if (sanitizedQuery.isBlank()) {
            Specification<Patient> spec = (root, cq, cb) -> {
                Predicate tenantPredicate = cb.equal(root.get("tenantId"), tenantId);
                Predicate notDeletedPredicate = cb.equal(root.get("deleted"), false);
                return cb.and(tenantPredicate, notDeletedPredicate);
            };
            Page<PatientSummary> result = patientRepository.findAll(spec, pageable).map(PatientService::toSummary);
            log.info("DEBUG: Pagination result - totalElements: {}, totalPages: {}, numberOfElements: {}", 
                    result.getTotalElements(), result.getTotalPages(), result.getNumberOfElements());
            return result;
        } else {
            Specification<Patient> spec = (root, cq, cb) -> {
                Predicate tenantPredicate = cb.equal(root.get("tenantId"), tenantId);
                Predicate notDeletedPredicate = cb.equal(root.get("deleted"), false);
                String likeQuery = "%" + sanitizedQuery.toLowerCase() + "%";
                Predicate orPredicate = cb.or(
                        cb.like(cb.lower(root.get("medicalRecordNumber")), likeQuery),
                        cb.like(cb.lower(root.get("firstName")), likeQuery),
                        cb.like(cb.lower(root.get("lastName")), likeQuery),
                        cb.like(cb.lower(root.get("phone")), likeQuery),
                        cb.like(cb.lower(root.get("email")), likeQuery)
                );
                return cb.and(tenantPredicate, notDeletedPredicate, orPredicate);
            };
            Page<PatientSummary> result = patientRepository.findAll(spec, pageable).map(PatientService::toSummary);
            log.info("DEBUG: Pagination result with query - totalElements: {}, totalPages: {}, numberOfElements: {}", 
                    result.getTotalElements(), result.getTotalPages(), result.getNumberOfElements());
            return result;
        }
    }

    private static PatientSummary toSummary(Patient patient) {
        Logger logger = LoggerFactory.getLogger(PatientService.class);
        logger.debug("Mapping patient to summary id={}", patient.getId());
        return new PatientSummary(
                patient.getId(),
                patient.getMedicalRecordNumber(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getDateOfBirth(),
                patient.getNationalId(),
                patient.getGender(),
                // Additional fields
                patient.getMiddleName(),
                patient.getAlternatePhone(),
                patient.getAddress(),
                patient.getCity(),
                patient.getState(),
                patient.getPostalCode(),
                patient.getCountry(),
                patient.getEmergencyContactName(),
                patient.getEmergencyContactPhone(),
                patient.getEmergencyContactRelationship(),
                patient.getAllergies(),
                patient.getMedications(),
                patient.getMedicalHistory(),
                patient.getNotes());
    }

    private PatientResponse toPatientResponse(Patient patient, VisitQueueItem queueItem) {
        log.debug("Mapping patient to response id={}", patient.getId());
        return new PatientResponse(
                patient.getId(),
                patient.getMedicalRecordNumber(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getDateOfBirth(),
                patient.getNationalId(),
                patient.getGender(),
                queueItem != null ? queueItem.getCurrentStatus() : null,
                queueItem != null ? queueItem.getPriority() : null,
                queueItem != null ? queueItem.getSlaDueAt() : null,
                queueItem != null ? queueItem.getTicketNumber() : null,
                // Additional fields
                patient.getMiddleName(),
                patient.getAlternatePhone(),
                patient.getAddress(),
                patient.getCity(),
                patient.getState(),
                patient.getPostalCode(),
                patient.getCountry(),
                patient.getEmergencyContactName(),
                patient.getEmergencyContactPhone(),
                patient.getEmergencyContactRelationship(),
                patient.getAllergies(),
                patient.getMedications(),
                patient.getMedicalHistory(),
                patient.getNotes());
    }

    private QueuePriority parsePriority(String value) {
        if (value == null || value.isBlank()) {
            return QueuePriority.MEDIUM;
        }
        return QueuePriority.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    private String generateTicketNumber(String tenantId, Long id) {
        String prefix = tenantId.length() > 3 ? tenantId.substring(0, 3).toUpperCase(Locale.ROOT) : tenantId.toUpperCase(Locale.ROOT);
        return prefix + "-T" + String.format("%05d", id);
    }

    @Transactional
    public void delete(String tenantId, Long id) {
        log.info("Deleting patient tenant={} id={}", tenantId, id);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Patient not found for deletion tenant={} id={}", tenantId, id);
                    return new EntityNotFoundException("Patient not found");
                });
        
        if (!patient.getTenantId().equals(tenantId)) {
            log.warn("Tenant mismatch for deletion tenant={} id={}", tenantId, id);
            throw new IllegalStateException("Tenant mismatch");
        }
        
        // Soft delete using BaseEntity method
        patient.softDelete();
        patientRepository.save(patient);
        
        log.info("Patient deleted tenant={} id={}", tenantId, id);
    }
}
