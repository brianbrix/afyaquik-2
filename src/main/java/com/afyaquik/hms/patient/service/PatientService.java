package com.afyaquik.hms.patient.service;

import com.afyaquik.hms.patient.api.CreatePatientRequest;
import com.afyaquik.hms.patient.api.PatientResponse;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.dto.PatientSummary;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;

import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    @Transactional
    public PatientResponse update(String tenantId, Long id, CreatePatientRequest request) {
        log.info("Updating patient tenant={} id={}", tenantId, id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Patient not found for update tenant={} id={}", tenantId, id);
                    return new EntityNotFoundException("Patient not found");
                });
        if (!patient.getTenantId().equals(tenantId)) {
            log.warn("Tenant mismatch for update tenant={} id={}", tenantId, id);
            throw new IllegalStateException("Tenant mismatch");
        }
        patient.setMedicalRecordNumber(request.medicalRecordNumber());
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setNationalId(request.nationalId());
        patient.setGender(request.gender());
        Patient saved = patientRepository.save(patient);
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
            Specification<Patient> tenantSpec = (root, cq, cb) -> cb.equal(root.get("tenantId"), tenantId);
            results = patientRepository.findAll(tenantSpec).stream()
                .map(PatientService::toSummary)
                .collect(Collectors.toList());
        } else {
            Specification<Patient> spec = (root, cq, cb) -> {
                Predicate tenantPredicate = cb.equal(root.get("tenantId"), tenantId);
                String likeQuery = "%" + sanitizedQuery.toLowerCase() + "%";
                Predicate orPredicate = cb.or(
                        cb.like(cb.lower(root.get("medicalRecordNumber")), likeQuery),
                        cb.like(cb.lower(root.get("firstName")), likeQuery),
                        cb.like(cb.lower(root.get("lastName")), likeQuery),
                        cb.like(cb.lower(root.get("phone")), likeQuery),
                        cb.like(cb.lower(root.get("email")), likeQuery)
                );
                return cb.and(tenantPredicate, orPredicate);
            };
            results = patientRepository.findAll(spec).stream()
                .map(PatientService::toSummary)
                .collect(Collectors.toList());
        }
        log.debug("Patient search found {} results for tenant={}", results.size(), tenantId);
        return results;
    }

    private static PatientSummary toSummary(Patient patient) {
        Logger log = LoggerFactory.getLogger(PatientService.class);
        log.debug("Mapping patient to summary id={}", patient.getId());
        return new PatientSummary(
                patient.getId(),
                patient.getMedicalRecordNumber(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getDateOfBirth());
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
                queueItem != null ? queueItem.getTicketNumber() : null);
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
}
