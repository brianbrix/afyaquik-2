  
package com.afyaquik.hms.queue.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.queue.domain.TriageEntry;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.dto.BulkTriageEntryRequest;
import com.afyaquik.hms.queue.dto.TriageEntryDto;
import com.afyaquik.hms.queue.dto.TriageEntryRequest;
import com.afyaquik.hms.queue.repository.TriageEntryRepository;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;

@Service
public class TriageEntryService {
    @Autowired
    private TriageEntryRepository triageEntryRepository;
    @Autowired
    private VisitQueueItemRepository queueItemRepository;

    public List<TriageEntryDto> getTriageEntriesForQueueItem(Long queueItemId) {
        return triageEntryRepository.findByQueueItemId(queueItemId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TriageEntryDto createTriageEntry(TriageEntryRequest request) {
    VisitQueueItem queueItem = queueItemRepository.findById(request.getQueueItemId())
        .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
    TriageEntry entry = new TriageEntry();
    entry.setQueueItem(queueItem);
    // Always set tenantId from queueItem if available, fallback to header
    if (queueItem.getTenantId() != null) {
        entry.setTenantId(queueItem.getTenantId());
    } else {
        entry.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
    }
    entry.setTitle(request.getTitle());
    entry.setDetails(request.getDetails());
    entry.setCreatedBy(request.getCreatedBy());
    TriageEntry saved = triageEntryRepository.save(entry);
    return toDto(saved);
    }

    @Transactional
    public void deleteTriageEntry(Long id) {
        triageEntryRepository.deleteById(id);
    }

    

    @Transactional
    public TriageEntryDto updateTriageEntry(Long id, TriageEntryRequest request) {
    TriageEntry entry = triageEntryRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Triage entry not found"));
    entry.setTitle(request.getTitle());
    entry.setDetails(request.getDetails());
    // Always set tenantId from queueItem if available, fallback to header
    VisitQueueItem queueItem = entry.getQueueItem();
    if (queueItem != null && queueItem.getTenantId() != null) {
        entry.setTenantId(queueItem.getTenantId());
    } else {
        entry.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
    }
    TriageEntry saved = triageEntryRepository.save(entry);
    return toDto(saved);
    }

    private TriageEntryDto toDto(TriageEntry entry) {
        return new TriageEntryDto(
                entry.getId(),
                entry.getTitle(),
                entry.getDetails(),
                entry.getCreatedBy(),
                entry.getCreatedAt()
        );
    }

    @Transactional
    public List<TriageEntryDto> bulkUpsertTriageEntries(Long queueItemId, BulkTriageEntryRequest request) {
    VisitQueueItem queueItem = queueItemRepository.findById(queueItemId)
        .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
    List<TriageEntry> existing = triageEntryRepository.findByQueueItemId(queueItemId);
    java.util.Map<Long, TriageEntry> existingMap = existing.stream().collect(Collectors.toMap(TriageEntry::getId, e -> e));
    
    // Check for duplicate titles within the request
    java.util.Set<String> titlesInRequest = new java.util.HashSet<>();
    java.util.List<String> duplicateTitles = new java.util.ArrayList<>();
    
    for (BulkTriageEntryRequest.BulkTriageEntryDto dto : request.getEntries()) {
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
            .map(TriageEntry::getTitle)
            .collect(Collectors.toSet());
    
    for (BulkTriageEntryRequest.BulkTriageEntryDto dto : request.getEntries()) {
        if (dto.getId() == null && existingTitles.contains(dto.getTitle())) {
            throw new IllegalArgumentException("A triage entry with title '" + dto.getTitle() + "' already exists");
        }
    }
    
    List<TriageEntry> toSave = new java.util.ArrayList<>();
    for (BulkTriageEntryRequest.BulkTriageEntryDto dto : request.getEntries()) {
        TriageEntry entry = dto.getId() != null && existingMap.containsKey(dto.getId())
            ? existingMap.get(dto.getId())
            : new TriageEntry();
        entry.setQueueItem(queueItem);
        // Always set tenantId from queueItem if available, fallback to header
        if (queueItem.getTenantId() != null) {
        entry.setTenantId(queueItem.getTenantId());
        } else {
        entry.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        }
        entry.setTitle(dto.getTitle());
        entry.setDetails(dto.getDetails());
        toSave.add(entry);
    }
    List<TriageEntry> saved = triageEntryRepository.saveAll(toSave);
    return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void bulkDeleteTriageEntries(Long queueItemId, BulkTriageEntryRequest request) {
        if (request.getIds() != null && !request.getIds().isEmpty()) {
            for (Long id : request.getIds()) {
                triageEntryRepository.deleteById(id);
            }
        }
    }
}
