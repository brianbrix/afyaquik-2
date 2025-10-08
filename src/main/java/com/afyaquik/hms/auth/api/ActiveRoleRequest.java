package com.afyaquik.hms.auth.api;

import jakarta.validation.constraints.NotBlank;

public record ActiveRoleRequest(@NotBlank String role) {
}
