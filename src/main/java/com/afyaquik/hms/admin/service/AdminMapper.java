package com.afyaquik.hms.admin.service;

import com.afyaquik.hms.admin.dto.DepartmentDto;
import com.afyaquik.hms.admin.dto.RoleDto;
import com.afyaquik.hms.admin.dto.UserDto;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public DepartmentDto toDto(Department d) {
        return new DepartmentDto(d.getId(), d.getDepartmentId(), d.getDisplayName(), d.getDescription());
    }

    public RoleDto toDto(StaffRole r) {
        return new RoleDto(r.getId(), r.getRoleKey(), r.getDisplayName());
    }

    public UserDto toDto(StaffUser u) {
        Set<RoleDto> roles = u.getRoles().stream().map(this::toDto).collect(Collectors.toSet());
        return new UserDto(u.getId(), u.getUsername(), u.getDisplayName(), u.getEmail(), u.isEnabled(), roles, u.getSupervisorId(), u.getSupervisorDisplayName());
    }
}
