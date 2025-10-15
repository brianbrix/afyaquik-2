package com.afyaquik.hms.auth.dto;

import com.afyaquik.hms.auth.domain.PermissionAssignment;

public class UpsertPermissionAssignmentRequest {
    private String permissionCode;
    private PermissionAssignment.TargetType targetType;
    private Long targetId;
    private PermissionAssignment.State state;

    public UpsertPermissionAssignmentRequest() {}

    public UpsertPermissionAssignmentRequest(String permissionCode, PermissionAssignment.TargetType targetType, Long targetId, PermissionAssignment.State state) {
        this.permissionCode = permissionCode;
        this.targetType = targetType;
        this.targetId = targetId;
        this.state = state;
    }

    public String getPermissionCode() {
        return permissionCode;
    }

    public void setPermissionCode(String permissionCode) {
        this.permissionCode = permissionCode;
    }

    public PermissionAssignment.TargetType getTargetType() {
        return targetType;
    }

    public void setTargetType(PermissionAssignment.TargetType targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public PermissionAssignment.State getState() {
        return state;
    }

    public void setState(PermissionAssignment.State state) {
        this.state = state;
    }
}
