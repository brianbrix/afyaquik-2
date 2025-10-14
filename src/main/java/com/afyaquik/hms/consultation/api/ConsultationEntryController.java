package com.afyaquik.hms.consultation.api;

import com.afyaquik.hms.consultation.dto.ConsultationEntryDto;
import com.afyaquik.hms.consultation.dto.ConsultationEntryRequest;
import com.afyaquik.hms.consultation.service.ConsultationEntryService;
import com.afyaquik.hms.consultation.dto.BulkConsultationEntryRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/queue/{queueItemId}/consultation-entries")
public class ConsultationEntryController {
    private final ConsultationEntryService service;

    public ConsultationEntryController(ConsultationEntryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@PathVariable Long queueItemId) {
        List<ConsultationEntryDto> entries = service.getEntriesForQueueItem(queueItemId);
        return ResponseEntity.ok(Map.of("data", entries));
    }

    @PostMapping
    public ResponseEntity<?> create(@PathVariable Long queueItemId, @RequestBody ConsultationEntryRequest request, Principal principal) {
        String createdBy = principal != null ? principal.getName() : null;
        ConsultationEntryDto created = service.createEntry(queueItemId, request, createdBy);
        return ResponseEntity.ok(Map.of("data", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long queueItemId, @PathVariable Long id, @RequestBody ConsultationEntryRequest request) {
        ConsultationEntryDto updated = service.updateEntry(id, request);
        return ResponseEntity.ok(Map.of("data", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long queueItemId, @PathVariable Long id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-upsert")
    public ResponseEntity<?> bulkUpsert(@PathVariable Long queueItemId, @RequestBody BulkConsultationEntryRequest request) {
        List<ConsultationEntryDto> result = service.bulkUpsertConsultationEntries(queueItemId, request);
        return ResponseEntity.ok(Map.of("data", result));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDelete(@PathVariable Long queueItemId, @RequestBody BulkConsultationEntryRequest request) {
        service.bulkDeleteConsultationEntries(queueItemId, request);
        return ResponseEntity.noContent().build();
    }
}
