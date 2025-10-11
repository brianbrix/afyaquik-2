package com.afyaquik.hms.auth.domain;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "permission_assignments")
public class PermissionAssignment {
    public enum TargetType { USER, GROUP, ROLE }
    public enum State { UNSET, ALLOWED, NOT_ALLOWED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetType targetType;

    @Column(nullable = false)
    private Long targetId; // userId, groupId, or roleId

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id")
    private Permission permission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private State state;

    public PermissionAssignment() {}
    public PermissionAssignment(TargetType targetType, Long targetId, Permission permission, State state) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.permission = permission;
        this.state = state;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TargetType getTargetType() { return targetType; }
    public void setTargetType(TargetType targetType) { this.targetType = targetType; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public Permission getPermission() { return permission; }
    public void setPermission(Permission permission) { this.permission = permission; }
    public State getState() { return state; }
    public void setState(State state) { this.state = state; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PermissionAssignment that = (PermissionAssignment) o;
        return targetType == that.targetType &&
                Objects.equals(targetId, that.targetId) &&
                Objects.equals(permission, that.permission);
    }
    @Override
    public int hashCode() {
        return Objects.hash(targetType, targetId, permission);
    }
}
