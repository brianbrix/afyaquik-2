package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @NotBlank @Size(max = 128) String displayName,
        @Size(max = 256) String description
) {}
