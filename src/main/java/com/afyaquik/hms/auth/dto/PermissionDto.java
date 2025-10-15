package com.afyaquik.hms.auth.dto;

public class PermissionDto {
    private Long id;
    private String code;
    private String description;

    public PermissionDto() {}

    public PermissionDto(Long id, String code, String description) {
        this.id = id;
        this.code = code;
        this.description = description;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
