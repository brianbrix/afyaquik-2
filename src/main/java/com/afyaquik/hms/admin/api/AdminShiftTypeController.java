package com.afyaquik.hms.admin.api;

import com.afyaquik.hms.scheduling.dto.ShiftTypeDto;
import com.afyaquik.hms.scheduling.service.ShiftTypeService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/shift-types")
public class AdminShiftTypeController {
    private final ShiftTypeService shiftTypeService;

    public AdminShiftTypeController(ShiftTypeService shiftTypeService) {
        this.shiftTypeService = shiftTypeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftTypeDto>>> list(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        List<ShiftTypeDto> result = shiftTypeService.list();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShiftTypeDto>> create(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody ShiftTypeDto dto) {
        ShiftTypeDto created = shiftTypeService.create(dto);
        if (created == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Shift type already exists"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftTypeDto>> update(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody ShiftTypeDto dto) {
        ShiftTypeDto updated = shiftTypeService.update(id, dto);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Shift type not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id) {
        boolean deleted = shiftTypeService.delete(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Shift type not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
