package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Size(max = 128) String displayName,
        @Email @Size(max = 128) String email,
        boolean enabled,
        Long supervisorId,
        String supervisorDisplayName
) {}
