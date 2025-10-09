package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record CreateUserRequest(
        @NotBlank @Size(max = 64) String username,
        @NotBlank @Size(max = 128) String displayName,
        @Email @Size(max = 128) String email,
        @NotBlank @Size(min = 6, max = 128) String password,
        Set<String> roleKeys
) {}
