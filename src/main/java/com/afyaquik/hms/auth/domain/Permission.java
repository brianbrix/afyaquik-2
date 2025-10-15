package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "permissions")
public class Permission extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code; // e.g. CREATE_PATIENT

    @Column(nullable = false)
    private String description;

    public Permission() {}
    public Permission(String code, String description) {
        this.code = code;
        this.description = description;
    }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Permission that = (Permission) o;
        return Objects.equals(code, that.code);
    }
    @Override
    public int hashCode() { return Objects.hash(code); }
}
