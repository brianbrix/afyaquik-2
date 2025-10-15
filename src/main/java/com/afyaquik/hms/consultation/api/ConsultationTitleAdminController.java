package com.afyaquik.hms.consultation.api;

import com.afyaquik.hms.consultation.dto.ConsultationTitleDto;
import com.afyaquik.hms.consultation.dto.ConsultationTitleRequest;
import com.afyaquik.hms.consultation.service.ConsultationTitleService;
import com.afyaquik.hms.common.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/consultation-titles")
public class ConsultationTitleAdminController {
    private final ConsultationTitleService service;

    public ConsultationTitleAdminController(ConsultationTitleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConsultationTitleDto>>> getAll() {
        List<ConsultationTitleDto> titles = service.getAll();
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/root")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<List<ConsultationTitleDto>>> getRootTitles() {
        List<ConsultationTitleDto> titles = service.getRootTitles();
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/children/{parentId}")
    public ResponseEntity<ApiResponse<List<ConsultationTitleDto>>> getChildren(@PathVariable Long parentId) {
        List<ConsultationTitleDto> titles = service.getChildren(parentId);
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<ApiResponse<List<ConsultationTitleDto>>> getByLevel(@PathVariable Integer level) {
        List<ConsultationTitleDto> titles = service.getByLevel(level);
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/parent-candidates")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<List<ConsultationTitleDto>>> getParentCandidates() {
        List<ConsultationTitleDto> titles = service.getParentCandidates();
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'VIEW_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<ConsultationTitleDto>> getById(@PathVariable Long id) {
        ConsultationTitleDto title = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success(title));
    }

    @PostMapping
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<ConsultationTitleDto>> create(@Valid @RequestBody ConsultationTitleRequest request) {
        ConsultationTitleDto created = service.create(request);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<ConsultationTitleDto>> update(@PathVariable Long id, @Valid @RequestBody ConsultationTitleRequest request) {
        ConsultationTitleDto updated = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'MANAGE_ADMIN_SETTINGS')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
