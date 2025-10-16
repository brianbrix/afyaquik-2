package com.afyaquik.hms.pharmacy.service;

import com.afyaquik.hms.pharmacy.domain.PharmacyAction;
import com.afyaquik.hms.pharmacy.dto.PharmacyActionDto;
import com.afyaquik.hms.pharmacy.dto.PharmacyActionRequest;
import com.afyaquik.hms.pharmacy.repository.PharmacyActionRepository;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PharmacyActionService {
    private final PharmacyActionRepository repository;
    private final VisitQueueItemRepository queueItemRepository;

    public PharmacyActionService(PharmacyActionRepository repository, VisitQueueItemRepository queueItemRepository) {
        this.repository = repository;
        this.queueItemRepository = queueItemRepository;
    }

    @Transactional(readOnly = true)
    public List<PharmacyActionDto> getActionsForQueueItem(Long queueItemId) {
        return repository.findByQueueItemIdOrderBySortOrderAsc(queueItemId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PharmacyActionDto createAction(Long queueItemId, PharmacyActionRequest request, String createdBy) {
        VisitQueueItem queueItem = queueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
        
        PharmacyAction action = new PharmacyAction();
        action.setQueueItem(queueItem);
        action.setTenantId(queueItem.getTenantId());
        action.setTitle(request.getTitle());
        action.setDetails(request.getDetails());
        action.setCategory(request.getCategory());
        action.setIsCustom(request.getIsCustom());
        action.setSortOrder(request.getSortOrder());
        action.setCreatedBy(createdBy);
        
        PharmacyAction saved = repository.save(action);
        return toDto(saved);
    }

    @Transactional
    public PharmacyActionDto updateAction(Long id, PharmacyActionRequest request) {
        PharmacyAction action = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pharmacy action not found"));
        
        action.setTitle(request.getTitle());
        action.setDetails(request.getDetails());
        action.setCategory(request.getCategory());
        action.setIsCustom(request.getIsCustom());
        action.setSortOrder(request.getSortOrder());
        
        PharmacyAction saved = repository.save(action);
        return toDto(saved);
    }

    @Transactional
    public void deleteAction(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public List<PharmacyActionDto> bulkUpsertActions(Long queueItemId, List<PharmacyActionRequest> requests, String createdBy) {
        VisitQueueItem queueItem = queueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found"));
        
        // Delete existing actions for this queue item
        repository.deleteByQueueItemId(queueItemId);
        
        // Create new actions
        List<PharmacyAction> actions = requests.stream().map(request -> {
            PharmacyAction action = new PharmacyAction();
            action.setQueueItem(queueItem);
            action.setTenantId(queueItem.getTenantId());
            action.setTitle(request.getTitle());
            action.setDetails(request.getDetails());
            action.setCategory(request.getCategory());
            action.setIsCustom(request.getIsCustom());
            action.setSortOrder(request.getSortOrder());
            action.setCreatedBy(createdBy);
            return action;
        }).collect(Collectors.toList());
        
        List<PharmacyAction> saved = repository.saveAll(actions);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    private PharmacyActionDto toDto(PharmacyAction action) {
        return new PharmacyActionDto(
                action.getId(),
                action.getTitle(),
                action.getDetails(),
                action.getCategory(),
                action.getIsCustom(),
                action.getSortOrder(),
                action.getCreatedBy(),
                action.getCreatedAt()
        );
    }
}

