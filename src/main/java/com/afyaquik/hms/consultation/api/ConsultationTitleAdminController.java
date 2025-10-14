package com.afyaquik.hms.consultation.api;

import com.afyaquik.hms.consultation.dto.ConsultationTitleDto;
import com.afyaquik.hms.consultation.service.ConsultationTitleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/consultation-titles")
public class ConsultationTitleAdminController {
    private final ConsultationTitleService service;

    public ConsultationTitleAdminController(ConsultationTitleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<ConsultationTitleDto> titles = service.getAll();
        return ResponseEntity.ok(Map.of("data", titles));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ConsultationTitleDto dto) {
        ConsultationTitleDto created = service.create(dto.getTitle());
        return ResponseEntity.ok(Map.of("data", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ConsultationTitleDto dto) {
        ConsultationTitleDto updated = service.update(id, dto.getTitle());
        return ResponseEntity.ok(Map.of("data", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
