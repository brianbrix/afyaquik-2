package com.afyaquik.hms.consultation.service;

import com.afyaquik.hms.consultation.domain.ConsultationEntry;
import com.afyaquik.hms.consultation.dto.ConsultationEntryDto;
import com.afyaquik.hms.consultation.dto.ConsultationEntryRequest;
import com.afyaquik.hms.consultation.repository.ConsultationEntryRepository;
import com.afyaquik.hms.consultation.dto.BulkConsultationEntryRequest;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsultationEntryService {
    private final ConsultationEntryRepository entryRepository;
    private final VisitQueueItemRepository queueItemRepository;

    public ConsultationEntryService(ConsultationEntryRepository entryRepository, VisitQueueItemRepository queueItemRepository) {
        this.entryRepository = entryRepository;
        this.queueItemRepository = queueItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ConsultationEntryDto> getEntriesForQueueItem(Long queueItemId) {
        return entryRepository.findByQueueItemId(queueItemId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConsultationEntryDto createEntry(Long queueItemId, ConsultationEntryRequest request, String createdBy) {
        VisitQueueItem queueItem = queueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
        ConsultationEntry entry = new ConsultationEntry();
        entry.setQueueItem(queueItem);
        entry.setTenantId(queueItem.getTenantId());
        entry.setTitle(request.getTitle());
        entry.setDetails(request.getDetails());
        entry.setCreatedBy(createdBy);
        ConsultationEntry saved = entryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public ConsultationEntryDto updateEntry(Long id, ConsultationEntryRequest request) {
        ConsultationEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Consultation entry not found"));
        entry.setTitle(request.getTitle());
        entry.setDetails(request.getDetails());
        ConsultationEntry saved = entryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public void deleteEntry(Long id) {
        entryRepository.deleteById(id);
    }

    @Transactional
    public List<ConsultationEntryDto> bulkUpsertConsultationEntries(Long queueItemId, BulkConsultationEntryRequest request) {
        VisitQueueItem queueItem = queueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
        List<ConsultationEntry> existing = entryRepository.findByQueueItemId(queueItemId);
        java.util.Map<Long, ConsultationEntry> existingMap = existing.stream().collect(Collectors.toMap(ConsultationEntry::getId, e -> e));
        List<ConsultationEntry> toSave = new java.util.ArrayList<>();
        for (BulkConsultationEntryRequest.BulkConsultationEntryDto dto : request.getEntries()) {
            ConsultationEntry entry = dto.getId() != null && existingMap.containsKey(dto.getId())
                    ? existingMap.get(dto.getId())
                    : new ConsultationEntry();
            entry.setQueueItem(queueItem);
            entry.setTenantId(queueItem.getTenantId());
            entry.setTitle(dto.getTitle());
            entry.setDetails(dto.getDetails());
            toSave.add(entry);
        }
        List<ConsultationEntry> saved = entryRepository.saveAll(toSave);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void bulkDeleteConsultationEntries(Long queueItemId, BulkConsultationEntryRequest request) {
        if (request.getIds() != null && !request.getIds().isEmpty()) {
            for (Long id : request.getIds()) {
                entryRepository.deleteById(id);
            }
        }
    }

    private ConsultationEntryDto toDto(ConsultationEntry entry) {
        return new ConsultationEntryDto(
                entry.getId(),
                entry.getTitle(),
                entry.getDetails(),
                entry.getCreatedBy(),
                entry.getCreatedAt()
        );
    }
}
