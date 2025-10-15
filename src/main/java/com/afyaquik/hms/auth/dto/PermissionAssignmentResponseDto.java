package com.afyaquik.hms.auth.dto;

public class PermissionAssignmentResponseDto {
    private Long id;
    private String targetType;
    private Long targetId;
    private String permissionCode;
    private String permissionDescription;
    private String state;

    public PermissionAssignmentResponseDto() {}

    public PermissionAssignmentResponseDto(Long id, String targetType, Long targetId, String permissionCode, 
                                        String permissionDescription, String state) {
        this.id = id;
        this.targetType = targetType;
        this.targetId = targetId;
        this.permissionCode = permissionCode;
        this.permissionDescription = permissionDescription;
        this.state = state;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getPermissionCode() {
        return permissionCode;
    }

    public void setPermissionCode(String permissionCode) {
        this.permissionCode = permissionCode;
    }

    public String getPermissionDescription() {
        return permissionDescription;
    }

    public void setPermissionDescription(String permissionDescription) {
        this.permissionDescription = permissionDescription;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
