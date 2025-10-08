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
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;
    private final VisitQueueItemRepository queueRepository;

    public PatientService(PatientRepository patientRepository, VisitQueueItemRepository queueRepository) {
        this.patientRepository = patientRepository;
        this.queueRepository = queueRepository;
    }

    @Transactional
    public PatientResponse register(String tenantId, CreatePatientRequest request) {
        patientRepository
                .findByTenantIdAndMedicalRecordNumber(tenantId, request.medicalRecordNumber())
                .ifPresent(existing -> {
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

        return toPatientResponse(saved, savedQueueItem);
    }

    public PatientResponse getByMrn(String tenantId, String medicalRecordNumber) {
        Patient patient = patientRepository
                .findByTenantIdAndMedicalRecordNumber(tenantId, medicalRecordNumber)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        VisitQueueItem queueItem = queueRepository
                .findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, patient.getId())
                .orElse(null);

        return toPatientResponse(patient, queueItem);
    }

    public List<PatientSummary> search(String tenantId, String query) {
        String sanitizedQuery = query == null ? "" : query.trim();
        if (sanitizedQuery.isBlank()) {
            return patientRepository.findByTenantIdAndLastNameContainingIgnoreCase(tenantId, "").stream()
                    .map(PatientService::toSummary)
                    .toList();
        }
        List<PatientSummary> byLastName = patientRepository
                .findByTenantIdAndLastNameContainingIgnoreCase(tenantId, sanitizedQuery)
                .stream()
                .map(PatientService::toSummary)
                .toList();
        List<PatientSummary> byPhone = patientRepository
                .findByTenantIdAndPhoneContainingIgnoreCase(tenantId, sanitizedQuery)
                .stream()
                .map(PatientService::toSummary)
                .toList();

        return java.util.stream.Stream.concat(byLastName.stream(), byPhone.stream())
                .distinct()
                .toList();
    }

    private static PatientSummary toSummary(Patient patient) {
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
