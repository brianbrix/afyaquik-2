package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record UpdateUserRolesRequest(@NotEmpty Set<String> roleKeys) {}
