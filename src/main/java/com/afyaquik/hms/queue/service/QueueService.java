package com.afyaquik.hms.queue.service;

import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.api.QueueAssignmentRequest;
import com.afyaquik.hms.queue.api.QueueCheckInRequest;
import com.afyaquik.hms.queue.api.QueueItemResponse;
import com.afyaquik.hms.queue.api.QueueTransitionRequest;
import com.afyaquik.hms.queue.domain.QueueEventType;
import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.QueueTimelineEntry;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.dto.QueueSummary;
import com.afyaquik.hms.queue.dto.QueueTimelineEntryResponse;
import com.afyaquik.hms.queue.repository.QueueTimelineEntryRepository;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.afyaquik.hms.queue.events.QueueEventPublisher;
import org.springframework.transaction.annotation.Transactional;


import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.domain.StaffUser;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@Transactional(readOnly = true)
public class QueueService {

    private static final Map<QueueStatus, Set<QueueStatus>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry(QueueStatus.PENDING_CHECKIN, Set.of(QueueStatus.IN_REGISTRATION, QueueStatus.CANCELLED, QueueStatus.NO_SHOW)),
            Map.entry(QueueStatus.IN_REGISTRATION, Set.of(QueueStatus.WAITING_TRIAGE, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.WAITING_TRIAGE, Set.of(QueueStatus.IN_TRIAGE, QueueStatus.IN_REGISTRATION)),
            Map.entry(QueueStatus.IN_TRIAGE, Set.of(QueueStatus.WAITING_PROVIDER, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.WAITING_PROVIDER, Set.of(QueueStatus.IN_CONSULT, QueueStatus.IN_TRIAGE, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.IN_CONSULT, Set.of(QueueStatus.WAITING_DIAGNOSTICS, QueueStatus.WAITING_PHARMACY, QueueStatus.WAITING_BILLING, QueueStatus.CLOSED, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.WAITING_DIAGNOSTICS, Set.of(QueueStatus.IN_DIAGNOSTICS, QueueStatus.WAITING_PROVIDER)),
            Map.entry(QueueStatus.IN_DIAGNOSTICS, Set.of(QueueStatus.WAITING_PROVIDER, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.WAITING_PHARMACY, Set.of(QueueStatus.IN_PHARMACY, QueueStatus.WAITING_PROVIDER)),
            Map.entry(QueueStatus.IN_PHARMACY, Set.of(QueueStatus.WAITING_BILLING, QueueStatus.WAITING_PROVIDER)),
            Map.entry(QueueStatus.WAITING_BILLING, Set.of(QueueStatus.IN_BILLING, QueueStatus.CLOSED, QueueStatus.BLOCKED)),
            Map.entry(QueueStatus.IN_BILLING, Set.of(QueueStatus.CLOSED, QueueStatus.WAITING_PROVIDER)),
            Map.entry(QueueStatus.BLOCKED, Set.of(QueueStatus.IN_REGISTRATION, QueueStatus.WAITING_TRIAGE, QueueStatus.WAITING_PROVIDER, QueueStatus.WAITING_BILLING)),
            Map.entry(QueueStatus.CLOSED, Set.of(QueueStatus.IN_BILLING, QueueStatus.IN_CONSULT)),
            Map.entry(QueueStatus.NO_SHOW, Set.of()),
            Map.entry(QueueStatus.CANCELLED, Set.of()));

    private final VisitQueueItemRepository queueRepository;
    private final PatientRepository patientRepository;
    private final QueueTimelineEntryRepository timelineRepository;
    private final QueueEventPublisher eventPublisher;

    private final StaffUserRepository staffUserRepository;

    @Autowired
    public QueueService(VisitQueueItemRepository queueRepository,
                        PatientRepository patientRepository,
                        QueueTimelineEntryRepository timelineRepository,
                        QueueEventPublisher eventPublisher,
                        StaffUserRepository staffUserRepository) {
        this.queueRepository = queueRepository;
        this.patientRepository = patientRepository;
        this.timelineRepository = timelineRepository;
        this.eventPublisher = eventPublisher;
        this.staffUserRepository = staffUserRepository;
    }

    @Transactional
    public QueueItemResponse checkIn(String tenantId, QueueCheckInRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (!tenantId.equals(patient.getTenantId())) {
            throw new EntityNotFoundException("Patient not found for tenant");
        }

        VisitQueueItem queueItem = new VisitQueueItem();
        queueItem.setTenantId(tenantId);
        queueItem.setPatient(patient);
        queueItem.setTicketNumber(generateTicketNumber(tenantId));
        queueItem.setVisitReason(request.visitReason());
        queueItem.setPriority(parsePriority(request.priority()));
        queueItem.setCurrentStatus(QueueStatus.PENDING_CHECKIN);
        queueItem.setDepartmentId(request.departmentId());
        queueItem.setSlaDueAt(calculateSlaDueAtForStatus(queueItem.getCurrentStatus(), queueItem.getPriority()));

        VisitQueueItem saved = queueRepository.save(queueItem);
        recordTimeline(saved, QueueEventType.CHECKED_IN, null, saved.getCurrentStatus(), null, null, null, saved.getDepartmentId(), "Patient checked in");
        QueueItemResponse response = toResponse(saved);
        eventPublisher.publish(response);
        return response;
    }


    public List<QueueSummary> listByStatus(String tenantId, QueueStatus status) {
        return queueRepository
                .findByTenantIdAndCurrentStatusOrderByCreatedAtAsc(tenantId, status)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public List<QueueSummary> listByStatusAndAssignee(String tenantId, QueueStatus status, String assigneeId) {
        if (assigneeId == null || assigneeId.isBlank()) {
            return List.of();
        }
        return queueRepository
                .findByTenantIdAndCurrentStatusAndCurrentAssigneeIdOrderByCreatedAtAsc(tenantId, status, assigneeId)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional
    public QueueItemResponse assign(String tenantId, Long queueItemId, QueueAssignmentRequest request) {
        VisitQueueItem queueItem = getQueueItemForTenant(tenantId, queueItemId);
        if (queueItem.getCurrentStatus() == QueueStatus.PENDING_CHECKIN) {
            throw new IllegalStateException("Cannot assign while patient is in PENDING_CHECKIN. Transition first.");
        }
    // Always store username as currentAssigneeId (assume assigneeId is username)
    queueItem.setCurrentAssigneeId(request.assigneeId());
        if (request.departmentId() != null && !request.departmentId().isBlank()) {
            queueItem.setDepartmentId(request.departmentId().trim());
        }

    VisitQueueItem saved = queueRepository.save(queueItem);
        recordTimeline(
                saved,
                QueueEventType.ASSIGNED,
                saved.getCurrentStatus(),
                saved.getCurrentStatus(),
                request.assigneeId(),
                request.assigneeRole(),
                request.assigneeDisplayName(),
                saved.getDepartmentId(),
                request.note());
    QueueItemResponse response = toResponse(saved);
    eventPublisher.publish(response);
    return response;
    }

    @Transactional
    public QueueItemResponse transitionStatus(String tenantId, Long queueItemId, QueueTransitionRequest request) {
        VisitQueueItem queueItem = getQueueItemForTenant(tenantId, queueItemId);
        QueueStatus targetStatus = parseStatus(request.targetStatus());

        ensureTransitionAllowed(queueItem.getCurrentStatus(), targetStatus);

        QueueStatus fromStatus = queueItem.getCurrentStatus();
        queueItem.setPreviousStatus(fromStatus);
        queueItem.setCurrentStatus(targetStatus);
        if (request.departmentId() != null && !request.departmentId().isBlank()) {
            queueItem.setDepartmentId(request.departmentId().trim());
        }
        queueItem.setSlaDueAt(calculateSlaDueAtForStatus(targetStatus, queueItem.getPriority()));

    VisitQueueItem saved = queueRepository.save(queueItem);
        recordTimeline(
                saved,
                QueueEventType.STATUS_CHANGED,
                fromStatus,
                targetStatus,
                request.actorId(),
                request.actorRole(),
                request.actorDisplayName(),
                saved.getDepartmentId(),
                request.note());
    QueueItemResponse response = toResponse(saved);
    eventPublisher.publish(response);
    return response;
    }

    @Transactional
    public QueueItemResponse advanceAndAssign(String tenantId, Long queueItemId, String targetStatusRaw, QueueAssignmentRequest assignReq) {
        VisitQueueItem queueItem = getQueueItemForTenant(tenantId, queueItemId);
        if (queueItem.getCurrentStatus() != QueueStatus.PENDING_CHECKIN) {
            throw new IllegalStateException("Advance & assign only valid from PENDING_CHECKIN");
        }
        QueueStatus targetStatus = parseStatus(targetStatusRaw);
        ensureTransitionAllowed(queueItem.getCurrentStatus(), targetStatus);
        QueueStatus fromStatus = queueItem.getCurrentStatus();
        queueItem.setPreviousStatus(fromStatus);
        queueItem.setCurrentStatus(targetStatus);
        queueItem.setSlaDueAt(calculateSlaDueAtForStatus(targetStatus, queueItem.getPriority()));
        // Perform assignment after status change
    // Always store username as currentAssigneeId (assume assigneeId is username)
    queueItem.setCurrentAssigneeId(assignReq.assigneeId());
        if (assignReq.departmentId() != null && !assignReq.departmentId().isBlank()) {
            queueItem.setDepartmentId(assignReq.departmentId().trim());
        }
        VisitQueueItem saved = queueRepository.save(queueItem);
        // Timeline entries: status then assignment for clarity
        recordTimeline(saved, QueueEventType.STATUS_CHANGED, fromStatus, targetStatus, assignReq.assigneeId(), assignReq.assigneeRole(), assignReq.assigneeDisplayName(), saved.getDepartmentId(), assignReq.note());
        recordTimeline(saved, QueueEventType.ASSIGNED, targetStatus, targetStatus, assignReq.assigneeId(), assignReq.assigneeRole(), assignReq.assigneeDisplayName(), saved.getDepartmentId(), assignReq.note());
        QueueItemResponse response = toResponse(saved);
        eventPublisher.publish(response);
        return response;
    }

    public List<QueueTimelineEntryResponse> getTimeline(String tenantId, Long queueItemId) {
        getQueueItemForTenant(tenantId, queueItemId);
    return timelineRepository.findByTenantIdAndQueueItem_IdOrderByCreatedAtAsc(tenantId, queueItemId)
                .stream()
                .map(this::toTimelineResponse)
                .toList();
    }

    private QueueItemResponse toResponse(VisitQueueItem item) {
        return new QueueItemResponse(
                item.getId(),
                item.getPatient().getId(),
        item.getTenantId(),
                item.getTicketNumber(),
                item.getVisitReason(),
                item.getCurrentStatus(),
                item.getPreviousStatus(),
                item.getPriority(),
                item.getCurrentAssigneeId(),
                item.getDepartmentId(),
                item.getCreatedAt(),
                item.getSlaDueAt());
    }

    private QueueSummary toSummary(VisitQueueItem item) {
        String patientName = item.getPatient().getFirstName() + " " + item.getPatient().getLastName();
        String assigneeUsername = null;
        if (item.getCurrentAssigneeId() != null && !item.getCurrentAssigneeId().isBlank()) {
            StaffUser user = staffUserRepository.findByTenantIdAndUsername(item.getTenantId(), item.getCurrentAssigneeId()).orElse(null);
            if (user != null) {
                assigneeUsername = user.getUsername();
            }
        }
        return new QueueSummary(
                item.getId(),
                item.getTicketNumber(),
                patientName,
                item.getVisitReason(),
                item.getCurrentStatus(),
                item.getPriority(),
                item.getCurrentAssigneeId(),
                assigneeUsername,
                item.getDepartmentId(),
                item.getCreatedAt(),
                item.getSlaDueAt());
    }

    private QueuePriority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return QueuePriority.MEDIUM;
        }
        return QueuePriority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
    }

    private QueueStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalStateException("Target status is required");
        }
        try {
            return QueueStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Unsupported target status: " + status);
        }
    }

    private VisitQueueItem getQueueItemForTenant(String tenantId, Long queueItemId) {
        VisitQueueItem item = queueRepository.findById(queueItemId)
                .orElseThrow(() -> new EntityNotFoundException("Queue item not found"));
        if (!tenantId.equals(item.getTenantId())) {
            throw new EntityNotFoundException("Queue item not found");
        }
        return item;
    }

    private void ensureTransitionAllowed(QueueStatus current, QueueStatus target) {
        Set<QueueStatus> allowedTargets = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowedTargets.contains(target)) {
            throw new IllegalStateException("Transition from " + current + " to " + target + " is not permitted");
        }
    }

    private Instant calculateSlaDueAtForStatus(QueueStatus status, QueuePriority priority) {
        return switch (status) {
            case PENDING_CHECKIN -> calculatePriorityWindow(priority);
            case IN_REGISTRATION -> Instant.now().plusSeconds(10 * 60L);
            case WAITING_TRIAGE -> Instant.now().plusSeconds(15 * 60L);
            case IN_TRIAGE -> Instant.now().plusSeconds(5 * 60L);
            case WAITING_PROVIDER -> Instant.now().plusSeconds(20 * 60L);
            case IN_CONSULT -> Instant.now().plusSeconds(25 * 60L);
            case WAITING_DIAGNOSTICS -> Instant.now().plusSeconds(30 * 60L);
            case IN_DIAGNOSTICS -> Instant.now().plusSeconds(15 * 60L);
            case WAITING_PHARMACY -> Instant.now().plusSeconds(15 * 60L);
            case IN_PHARMACY -> Instant.now().plusSeconds(10 * 60L);
            case WAITING_BILLING -> Instant.now().plusSeconds(20 * 60L);
            case IN_BILLING -> Instant.now().plusSeconds(10 * 60L);
            default -> null;
        };
    }

    private Instant calculatePriorityWindow(QueuePriority priority) {
        int minutes = switch (priority) {
            case CRITICAL -> 5;
            case HIGH -> 10;
            case MEDIUM -> 20;
            case LOW -> 30;
        };
        return Instant.now().plusSeconds(minutes * 60L);
    }

    private void recordTimeline(VisitQueueItem item,
                                QueueEventType eventType,
                                QueueStatus fromStatus,
                                QueueStatus toStatus,
                                String actorId,
                                String actorRole,
                                String actorDisplayName,
                                String departmentId,
                                String note) {
        QueueTimelineEntry entry = new QueueTimelineEntry();
        entry.setTenantId(item.getTenantId());
        entry.setQueueItem(item);
        entry.setEventType(eventType);
        entry.setFromStatus(fromStatus);
        entry.setToStatus(toStatus);
        entry.setActorId(actorId);
        entry.setActorRole(actorRole);
        entry.setActorDisplayName(actorDisplayName);
        entry.setDepartmentId(departmentId);
        entry.setNote(note);
        timelineRepository.save(entry);
    }

    private QueueTimelineEntryResponse toTimelineResponse(QueueTimelineEntry entry) {
        return new QueueTimelineEntryResponse(
                entry.getId(),
                entry.getEventType(),
                entry.getFromStatus(),
                entry.getToStatus(),
                entry.getActorId(),
                entry.getActorRole(),
                entry.getActorDisplayName(),
                entry.getNote(),
                entry.getDepartmentId(),
                entry.getCreatedAt());
    }

    private String generateTicketNumber(String tenantId) {
        String prefix = tenantId.length() > 3 ? tenantId.substring(0, 3).toUpperCase(Locale.ROOT) : tenantId.toUpperCase(Locale.ROOT);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase(Locale.ROOT);
        return prefix + "-" + suffix;
    }
}
