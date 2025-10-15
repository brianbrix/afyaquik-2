package com.afyaquik.hms.admin.entity;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "queue_status_role_visibility", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role_key", "queue_status"})
})
public class QueueStatusRoleVisibility extends BaseEntity implements Serializable {

    @Column(name = "role_key", nullable = false, length = 64)
    private String roleKey;

    @Column(name = "queue_status", nullable = false, length = 64)
    private String queueStatus;

    public QueueStatusRoleVisibility() {}
    public QueueStatusRoleVisibility(String roleKey, String queueStatus) {
        this.roleKey = roleKey;
        this.queueStatus = queueStatus;
    }

    public String getRoleKey() { return roleKey; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }
    public String getQueueStatus() { return queueStatus; }
    public void setQueueStatus(String queueStatus) { this.queueStatus = queueStatus; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QueueStatusRoleVisibility that = (QueueStatusRoleVisibility) o;
        return Objects.equals(roleKey, that.roleKey) && Objects.equals(queueStatus, that.queueStatus);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleKey, queueStatus);
    }
}
