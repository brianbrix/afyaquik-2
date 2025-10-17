package com.afyaquik.hms.dashboard.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.repository.DiagnosticOrderRepository;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import com.afyaquik.hms.scheduling.repository.TimeOffRequestRepository;
import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private VisitQueueItemRepository queueRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private DiagnosticOrderRepository diagnosticOrderRepository;

    @Autowired
    private StaffShiftRepository staffShiftRepository;

    @Autowired
    private TimeOffRequestRepository timeOffRequestRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    public Map<String, Object> getSystemDashboard() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        Map<String, Object> stats = new HashMap<>();

        // Queue statistics
        stats.put("totalPatients", patientRepository.countByTenantId(tenantId));
        stats.put("pendingCheckIn", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.PENDING_CHECKIN));
        stats.put("inTriage", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.IN_TRIAGE));
        stats.put("inConsult", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.IN_CONSULT));
        stats.put("inDiagnostics", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.IN_DIAGNOSTICS));
        stats.put("inPharmacy", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.IN_PHARMACY));
        stats.put("inBilling", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.IN_BILLING));
        stats.put("blocked", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.BLOCKED));
        stats.put("closed", queueRepository.countByTenantIdAndCurrentStatus(tenantId, QueueStatus.CLOSED));

        // Financial statistics
        stats.put("totalBills", billRepository.countForCurrentTenant());
        stats.put("pendingBills", billRepository.countByStatusForCurrentTenant(com.afyaquik.hms.billing.domain.BillStatus.SENT));
        stats.put("paidBills", billRepository.countByStatusForCurrentTenant(com.afyaquik.hms.billing.domain.BillStatus.PAID));

        // Diagnostics statistics
        stats.put("totalDiagnosticOrders", diagnosticOrderRepository.countForCurrentTenant());
        stats.put("pendingDiagnostics", diagnosticOrderRepository.countByStatusForCurrentTenant(com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus.ORDERED));

        return stats;
    }

    public Map<String, Object> getUserDashboard(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        Map<String, Object> stats = new HashMap<>();

        // Get current user
        StaffUser user = staffUserRepository.findByUsernameAndDeletedFalseForCurrentTenant(username);
        if (user == null) {
            return stats;
        }

        Long userId = user.getId();

        // User-specific queue statistics
        stats.put("myAssignedItems", queueRepository.countByTenantIdAndCurrentAssigneeId(tenantId, username));
        stats.put("myPendingItems", queueRepository.countByTenantIdAndCurrentAssigneeIdAndCurrentStatus(tenantId, username, QueueStatus.PENDING_CHECKIN));
        stats.put("myInProgressItems", queueRepository.countByTenantIdAndCurrentAssigneeIdAndCurrentStatusIn(tenantId, username, 
            QueueStatus.IN_TRIAGE, QueueStatus.IN_CONSULT, QueueStatus.IN_DIAGNOSTICS, QueueStatus.IN_PHARMACY, QueueStatus.IN_BILLING));

        // User's shift statistics
        LocalDate today = LocalDate.now();
        OffsetDateTime startOfDay = today.atStartOfDay().atOffset(java.time.ZoneOffset.UTC);
        OffsetDateTime endOfDay = today.plusDays(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC);

        stats.put("todayShiftStatus", getTodayShiftStatus(userId, startOfDay, endOfDay));
        stats.put("isOnShift", isUserOnShift(userId, startOfDay, endOfDay));

        // Time-off statistics
        stats.put("myPendingTimeOff", timeOffRequestRepository.countByTenantIdAndUserIdAndStatus(tenantId, userId, TimeOffStatus.PENDING));
        stats.put("myApprovedTimeOff", timeOffRequestRepository.countByTenantIdAndUserIdAndStatus(tenantId, userId, TimeOffStatus.APPROVED));

        // Supervisor statistics (if user is a supervisor)
        if (user.getSupervisorId() != null || staffUserRepository.findBySupervisorIdAndDeletedFalse(userId).size() > 0) {
            stats.put("isSupervisor", true);
            stats.put("teamMembers", staffUserRepository.findBySupervisorIdAndDeletedFalse(userId).size());
            stats.put("pendingTeamTimeOff", timeOffRequestRepository.countBySupervisorIdAndStatusForCurrentTenant(userId, TimeOffStatus.PENDING));
        } else {
            stats.put("isSupervisor", false);
        }

        // Role-based statistics
        if (user.getRoles().stream().anyMatch(role -> role.getRoleKey().equals("ADMIN"))) {
            stats.put("isAdmin", true);
            stats.put("totalUsers", staffUserRepository.countForCurrentTenant());
            stats.put("activeUsers", staffUserRepository.countByTenantIdAndDeletedFalse(tenantId));
        } else {
            stats.put("isAdmin", false);
        }

        return stats;
    }

    private String getTodayShiftStatus(Long userId, OffsetDateTime startOfDay, OffsetDateTime endOfDay) {
        // Check if user has a shift today
        var todayShifts = staffShiftRepository.findByStaffUserIdAndStartsAtBetween(userId, startOfDay.toLocalDateTime(), endOfDay.toLocalDateTime());
        
        if (todayShifts.isEmpty()) {
            return "NO_SHIFT";
        }

        var currentShift = todayShifts.get(0);
        return currentShift.getStatus().name();
    }

    private boolean isUserOnShift(Long userId, OffsetDateTime startOfDay, OffsetDateTime endOfDay) {
        var todayShifts = staffShiftRepository.findByStaffUserIdAndStartsAtBetween(userId, startOfDay.toLocalDateTime(), endOfDay.toLocalDateTime());
        
        if (todayShifts.isEmpty()) {
            return false;
        }

        var currentShift = todayShifts.get(0);
        return currentShift.getStatus() == ShiftStatus.IN_PROGRESS || currentShift.getStatus() == ShiftStatus.CHECKED_IN;
    }
}
