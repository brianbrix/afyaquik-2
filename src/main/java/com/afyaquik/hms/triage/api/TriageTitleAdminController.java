package com.afyaquik.hms.triage.api;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.triage.dto.TriageTitleDto;
import com.afyaquik.hms.triage.service.TriageTitleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/triage-titles")
public class TriageTitleAdminController {
    private final TriageTitleService service;

    public TriageTitleAdminController(TriageTitleService service) {
        this.service = service;
    }

    @GetMapping
    public List<TriageTitleDto> getAll() {
        return service.getAll();
    }

    @PostMapping
    public TriageTitleDto create(@RequestBody TriageTitleDto dto) {
        return service.create(dto.getTitle());
    }

    @PutMapping("/{id}")
    public TriageTitleDto update(@PathVariable Long id, @RequestBody TriageTitleDto dto) {
        return service.update(id, dto.getTitle());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
