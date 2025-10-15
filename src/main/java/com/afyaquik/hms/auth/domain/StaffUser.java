package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "staff_users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_staff_user_tenant_username", columnNames = {"tenant_id", "username"})
})
public class StaffUser extends BaseEntity {
    @ManyToMany(mappedBy = "members")
    private Set<UserGroup> groups = new HashSet<>();

    public Set<UserGroup> getGroups() { return groups; }
    public void setGroups(Set<UserGroup> groups) { this.groups = groups; }
    public void addGroup(UserGroup group) { this.groups.add(group); }
    public void removeGroup(UserGroup group) { this.groups.remove(group); }

    @Column(name = "username", nullable = false, length = 64)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

    @Column(name = "email", length = 128)
    private String email;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "staff_user_roles",
            joinColumns = @JoinColumn(name = "staff_user_id"),
            inverseJoinColumns = @JoinColumn(name = "staff_role_id"))
    private Set<StaffRole> roles = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "staff_user_departments",
            joinColumns = @JoinColumn(name = "staff_user_id"),
            inverseJoinColumns = @JoinColumn(name = "department_id"))
    private Set<Department> departments = new HashSet<>();

    @Column(name = "supervisor_id")
    private Long supervisorId;

    @Column(name = "supervisor_display_name", length = 128)
    private String supervisorDisplayName;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<StaffRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<StaffRole> roles) {
        this.roles = roles;
    }

    public void addRole(StaffRole role) {
        this.roles.add(role);
    }

    public Set<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(Set<Department> departments) {
        this.departments = departments;
    }

    public void addDepartment(Department department) { this.departments.add(department); }

    public Long getSupervisorId() {
        return supervisorId;
    }

    public void setSupervisorId(Long supervisorId) {
        this.supervisorId = supervisorId;
    }

    public String getSupervisorDisplayName() {
        return supervisorDisplayName;
    }

    public void setSupervisorDisplayName(String supervisorDisplayName) {
        this.supervisorDisplayName = supervisorDisplayName;
    }
}
