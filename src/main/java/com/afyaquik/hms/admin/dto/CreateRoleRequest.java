package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
        @NotBlank @Size(max = 64) String roleKey,
        @NotBlank @Size(max = 128) String displayName
) {}
