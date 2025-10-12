package com.afyaquik.hms.directory.api;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Lightweight staff directory endpoint used by queue assignment UI. */
@RestController
@RequestMapping("/api/v1/directory")
public class StaffDirectoryController {

    private final StaffUserRepository staffUserRepository;

    public StaffDirectoryController(StaffUserRepository staffUserRepository) {
        this.staffUserRepository = staffUserRepository;
    }

    public record StaffDirectoryEntry(Long id, String username, String displayName, List<String> roles, List<String> departments) {}

    @GetMapping("/staff")
    public ApiResponse<List<StaffDirectoryEntry>> listStaff(
            @RequestParam(name = "q", required = false) String q) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String query = q == null ? null : q.trim().toLowerCase(Locale.ROOT);
        java.util.stream.Stream<StaffUser> stream = staffUserRepository.findByTenantIdWithDepartments(tenantId).stream().filter(StaffUser::isEnabled);
        if (query != null && !query.isBlank()) {
            stream = stream.filter(u -> u.getUsername().toLowerCase(Locale.ROOT).contains(query) ||
                    u.getDisplayName().toLowerCase(Locale.ROOT).contains(query));
        }
        List<StaffDirectoryEntry> entries = stream
        .map(u -> new StaffDirectoryEntry(
            u.getId(),
            u.getUsername(),
            u.getDisplayName(),
            u.getRoles().stream().map(r -> r.getRoleKey() == null ? null : r.getRoleKey().toUpperCase()).sorted().toList(),
            u.getDepartments().stream().map(d -> d.getDepartmentId()).sorted().toList()
        ))
                .sorted((a,b) -> a.displayName.compareToIgnoreCase(b.displayName))
                .toList();
        return ApiResponse.success(entries);
    }
}
