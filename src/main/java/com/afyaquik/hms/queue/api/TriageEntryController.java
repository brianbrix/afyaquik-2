
package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.queue.dto.TriageEntryDto;
import com.afyaquik.hms.queue.dto.TriageEntryRequest;
import com.afyaquik.hms.queue.dto.BulkTriageEntryRequest;
import com.afyaquik.hms.queue.service.TriageEntryService;
import com.afyaquik.hms.common.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/queue/{queueItemId}/triage-entries")
public class TriageEntryController {
    @Autowired
    private TriageEntryService triageEntryService;

    @GetMapping
    public ApiResponse<List<TriageEntryDto>> getTriageEntries(@PathVariable Long queueItemId) {
        return ApiResponse.success(triageEntryService.getTriageEntriesForQueueItem(queueItemId));
    }

    @PostMapping
    public ApiResponse<TriageEntryDto> createTriageEntry(@PathVariable Long queueItemId, @Valid @RequestBody TriageEntryRequest request) {
        request.setQueueItemId(queueItemId);
        return ApiResponse.success(triageEntryService.createTriageEntry(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TriageEntryDto> updateTriageEntry(@PathVariable Long queueItemId, @PathVariable Long id, @Valid @RequestBody TriageEntryRequest request) {
        request.setQueueItemId(queueItemId);
        return ApiResponse.success(triageEntryService.updateTriageEntry(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTriageEntry(@PathVariable Long queueItemId, @PathVariable Long id) {
        triageEntryService.deleteTriageEntry(id);
    return ApiResponse.success(null);
    }
    @PostMapping("/bulk")
    public ApiResponse<List<TriageEntryDto>> bulkUpsertTriageEntries(@PathVariable Long queueItemId, @RequestBody BulkTriageEntryRequest request) {
        return ApiResponse.success(triageEntryService.bulkUpsertTriageEntries(queueItemId, request));
    }

    @PostMapping("/bulk-delete")
    public ApiResponse<Void> bulkDeleteTriageEntries(@PathVariable Long queueItemId, @RequestBody BulkTriageEntryRequest request) {
        triageEntryService.bulkDeleteTriageEntries(queueItemId, request);
        return ApiResponse.success(null);
    }
}
