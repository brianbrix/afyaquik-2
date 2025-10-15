package com.afyaquik.hms.inventory.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.domain.TenantAwareEntity;
import com.afyaquik.hms.auth.domain.Department;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "requisitions")
public class Requisition extends BaseEntity implements TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "requisition_number", unique = true, nullable = false)
    private String requisitionNumber;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    @NotNull
    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;
    
    @Column(name = "required_date")
    private LocalDate requiredDate;
    
    @Column(name = "requested_by")
    private String requestedBy;
    
    @Column(name = "approved_by")
    private String approvedBy;
    
    @Column(name = "approved_at")
    private LocalDate approvedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequisitionStatus status = RequisitionStatus.PENDING;
    
    @Column(name = "priority")
    private String priority;
    
    @Column(name = "notes")
    private String notes;
    
    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RequisitionItem> items = new ArrayList<>();
    
    // Enums
    public enum RequisitionStatus {
        PENDING, APPROVED, PARTIALLY_FULFILLED, FULFILLED, REJECTED, CANCELLED
    }
    
    // Constructors
    public Requisition() {}
    
    public Requisition(String requisitionNumber, Department department, LocalDate requestDate) {
        this.requisitionNumber = requisitionNumber;
        this.department = department;
        this.requestDate = requestDate;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRequisitionNumber() { return requisitionNumber; }
    public void setRequisitionNumber(String requisitionNumber) { this.requisitionNumber = requisitionNumber; }
    
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    
    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }
    
    public LocalDate getRequiredDate() { return requiredDate; }
    public void setRequiredDate(LocalDate requiredDate) { this.requiredDate = requiredDate; }
    
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    
    public LocalDate getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDate approvedAt) { this.approvedAt = approvedAt; }
    
    public RequisitionStatus getStatus() { return status; }
    public void setStatus(RequisitionStatus status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public List<RequisitionItem> getItems() { return items; }
    public void setItems(List<RequisitionItem> items) { this.items = items; }
    
    // Business methods
    public boolean isFullyFulfilled() {
        return items.stream().allMatch(item -> item.getQuantityFulfilled() >= item.getQuantityRequested());
    }
    
    public boolean isPartiallyFulfilled() {
        return items.stream().anyMatch(item -> item.getQuantityFulfilled() > 0 && item.getQuantityFulfilled() < item.getQuantityRequested());
    }
}
