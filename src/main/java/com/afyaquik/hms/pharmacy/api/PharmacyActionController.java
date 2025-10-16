package com.afyaquik.hms.pharmacy.api;

import com.afyaquik.hms.pharmacy.dto.PharmacyActionDto;
import com.afyaquik.hms.pharmacy.dto.PharmacyActionRequest;
import com.afyaquik.hms.pharmacy.service.PharmacyActionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/queue/{queueItemId}/pharmacy-actions")
public class PharmacyActionController {
    private final PharmacyActionService service;

    public PharmacyActionController(PharmacyActionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@PathVariable Long queueItemId) {
        List<PharmacyActionDto> actions = service.getActionsForQueueItem(queueItemId);
        return ResponseEntity.ok(Map.of("data", actions));
    }

    @PostMapping
    public ResponseEntity<?> create(@PathVariable Long queueItemId, @RequestBody PharmacyActionRequest request, Principal principal) {
        String createdBy = principal != null ? principal.getName() : null;
        PharmacyActionDto created = service.createAction(queueItemId, request, createdBy);
        return ResponseEntity.ok(Map.of("data", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long queueItemId, @PathVariable Long id, @RequestBody PharmacyActionRequest request) {
        PharmacyActionDto updated = service.updateAction(id, request);
        return ResponseEntity.ok(Map.of("data", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long queueItemId, @PathVariable Long id) {
        service.deleteAction(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-upsert")
    public ResponseEntity<?> bulkUpsert(@PathVariable Long queueItemId, @RequestBody BulkPharmacyActionRequest request, Principal principal) {
        String createdBy = principal != null ? principal.getName() : null;
        List<PharmacyActionDto> actions = service.bulkUpsertActions(queueItemId, request.getActions(), createdBy);
        return ResponseEntity.ok(Map.of("data", actions));
    }

    public static class BulkPharmacyActionRequest {
        private List<PharmacyActionRequest> actions;

        public List<PharmacyActionRequest> getActions() { return actions; }
        public void setActions(List<PharmacyActionRequest> actions) { this.actions = actions; }
    }
}
