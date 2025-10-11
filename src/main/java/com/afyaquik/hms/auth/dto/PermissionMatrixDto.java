package com.afyaquik.hms.auth.dto;

import com.afyaquik.hms.auth.domain.PermissionAssignment;
import java.util.Map;

public class PermissionMatrixDto {
    private Map<String, PermissionAssignment.State> permissions; // key: permission code

    public PermissionMatrixDto() {}
    public PermissionMatrixDto(Map<String, PermissionAssignment.State> permissions) {
        this.permissions = permissions;
    }
    public Map<String, PermissionAssignment.State> getPermissions() { return permissions; }
    public void setPermissions(Map<String, PermissionAssignment.State> permissions) { this.permissions = permissions; }
}
