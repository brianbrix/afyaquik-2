package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDepartmentRequest(
        @NotBlank @Size(max = 64) String departmentId,
        @NotBlank @Size(max = 128) String displayName,
        @Size(max = 256) String description
) {}
