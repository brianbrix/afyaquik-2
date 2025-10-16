package com.afyaquik.hms.consultation.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.consultation.domain.ConsultationEntry;
import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import com.afyaquik.hms.consultation.dto.BulkConsultationEntryRequest;
import com.afyaquik.hms.consultation.dto.ConsultationEntryDto;
import com.afyaquik.hms.consultation.dto.ConsultationEntryRequest;
import com.afyaquik.hms.consultation.repository.ConsultationEntryRepository;
import com.afyaquik.hms.consultation.repository.ConsultationTitleRepository;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;

@Service
public class ConsultationEntryService {
    private final ConsultationEntryRepository entryRepository;
    private final VisitQueueItemRepository queueItemRepository;
    private final ConsultationTitleRepository consultationTitleRepository;

    public ConsultationEntryService(ConsultationEntryRepository entryRepository, VisitQueueItemRepository queueItemRepository, ConsultationTitleRepository consultationTitleRepository) {
        this.entryRepository = entryRepository;
        this.queueItemRepository = queueItemRepository;
        this.consultationTitleRepository = consultationTitleRepository;
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
        
        // Link to consultation title if provided
        if (request.getConsultationTitleId() != null) {
            ConsultationTitle consultationTitle = consultationTitleRepository.findById(request.getConsultationTitleId())
                    .orElseThrow(() -> new IllegalArgumentException("Consultation title not found"));
            entry.setConsultationTitle(consultationTitle);
            entry.setIsCustom(false);
        } else {
            entry.setIsCustom(true);
        }
        
        entry.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        
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
        
        // Check for duplicate titles within the request
        java.util.Set<String> titlesInRequest = new java.util.HashSet<>();
        java.util.List<String> duplicateTitles = new java.util.ArrayList<>();
        
        for (BulkConsultationEntryRequest.BulkConsultationEntryDto dto : request.getEntries()) {
            if (dto.getId() == null) { // Only check for new entries
                if (titlesInRequest.contains(dto.getTitle())) {
                    duplicateTitles.add(dto.getTitle());
                } else {
                    titlesInRequest.add(dto.getTitle());
                }
            }
        }
        
        if (!duplicateTitles.isEmpty()) {
            throw new IllegalArgumentException("Duplicate titles found in request: " + String.join(", ", duplicateTitles));
        }
        
        // Check for duplicates with existing entries
        java.util.Set<String> existingTitles = existing.stream()
                .map(ConsultationEntry::getTitle)
                .collect(Collectors.toSet());
        
        for (BulkConsultationEntryRequest.BulkConsultationEntryDto dto : request.getEntries()) {
            if (dto.getId() == null && existingTitles.contains(dto.getTitle())) {
                throw new IllegalArgumentException("A consultation entry with title '" + dto.getTitle() + "' already exists");
            }
        }
        
        List<ConsultationEntry> toSave = new java.util.ArrayList<>();
        for (BulkConsultationEntryRequest.BulkConsultationEntryDto dto : request.getEntries()) {
            ConsultationEntry entry = dto.getId() != null && existingMap.containsKey(dto.getId())
                    ? existingMap.get(dto.getId())
                    : new ConsultationEntry();
            entry.setQueueItem(queueItem);
            entry.setTenantId(queueItem.getTenantId());
            entry.setTitle(dto.getTitle());
            entry.setDetails(dto.getDetails());
            
            // Handle consultation title linking
            if (dto.getConsultationTitleId() != null) {
                ConsultationTitle consultationTitle = consultationTitleRepository.findById(dto.getConsultationTitleId())
                        .orElse(null);
                entry.setConsultationTitle(consultationTitle);
                entry.setIsCustom(false);
            } else {
                entry.setIsCustom(true);
            }
            
            entry.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
            
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
        ConsultationEntryDto dto = new ConsultationEntryDto(
                entry.getId(),
                entry.getTitle(),
                entry.getDetails(),
                entry.getCreatedBy(),
                entry.getCreatedAt()
        );
        
        // Add hierarchy information if consultation title is linked
        if (entry.getConsultationTitle() != null) {
            dto.setConsultationTitleId(entry.getConsultationTitle().getId());
            dto.setConsultationTitleName(entry.getConsultationTitle().getTitle());
            dto.setConsultationTitleLevel(entry.getConsultationTitle().getLevel());
        }
        
        dto.setIsCustom(entry.getIsCustom());
        dto.setSortOrder(entry.getSortOrder());
        
        return dto;
    }
}
