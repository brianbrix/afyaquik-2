package com.afyaquik.hms.reports.repository;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.reports.domain.PatientReport;
import com.afyaquik.hms.reports.domain.PatientReportDto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

/**
 * Implementation of ReportRepository for custom report queries.
 */
@Repository
public class ReportRepositoryImpl implements ReportRepository {

    @Autowired
    private EntityManager entityManager;

    // No conversion methods needed since we're using LocalDate directly

    @Override
    public List<PatientReport> getPatientReportData(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT new com.afyaquik.hms.reports.domain.PatientReportDto(" +
                "p.medicalRecordNumber, " +
                "CONCAT(p.firstName, ' ', p.lastName), " +
                "p.phone, " +
                "p.email, " +
                "p.dateOfBirth, " +
                "p.gender, " +
                "p.address, " +
                "p.city, " +
                "p.state, " +
                "p.country, " +
                "CAST(p.createdAt AS java.time.LocalDateTime), " +
                "CAST(p.updatedAt AS java.time.LocalDateTime), " +
                "CAST((SELECT COUNT(v) FROM VisitQueueItem v WHERE v.patient.id = p.id) AS int), " +
                "CAST((SELECT COUNT(b) FROM Bill b WHERE b.patientId = p.id) AS int), " +
                "'General', " +
                "'Active') " +
                "FROM Patient p " +
                "WHERE p.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR p.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        @SuppressWarnings("unchecked")
        List<PatientReportDto> dtos = query.getResultList();
        
        return dtos.stream()
                .map(PatientReportDto::toPatientReport)
                .toList();
    }

    @Override
    public Double getTotalRevenue(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).doubleValue() : 0.0;
    }

    @Override
    public Long getTotalBills(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public Double getPaidAmount(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT SUM(b.paidAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.status = 'PAID' " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).doubleValue() : 0.0;
    }

    @Override
    public Double getPendingAmount(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT SUM(b.balanceDue) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.status = 'PENDING' " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).doubleValue() : 0.0;
    }

    @Override
    public Long getTotalPatients(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(p) FROM Patient p WHERE p.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR p.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public Long getTotalQueueItems(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(q) FROM VisitQueueItem q WHERE q.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR q.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public Long getActiveUsers(String tenantId) {
        String jpql = "SELECT COUNT(u) FROM UserProfile u WHERE u.tenantId = :tenantId";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public List<Object[]> getRevenueByDepartment(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT d.displayName, SUM(b.totalAmount), COUNT(b) " +
                "FROM Bill b " +
                "JOIN VisitQueueItem q ON b.queueItemId = q.id " +
                "JOIN Department d ON q.departmentId = d.departmentId " +
                "WHERE b.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
                "GROUP BY d.displayName";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return query.getResultList();
    }

    @Override
    public List<Object[]> getDailyRevenue(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT DATE(b.createdAt), SUM(b.totalAmount), COUNT(b) " +
                "FROM Bill b " +
                "WHERE b.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
                "GROUP BY DATE(b.createdAt) " +
                "ORDER BY DATE(b.createdAt)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return query.getResultList();
    }

    @Override
    public List<Object[]> getBillStatusSummary(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT b.status, COUNT(b), SUM(b.totalAmount) " +
                "FROM Bill b " +
                "WHERE b.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
                "GROUP BY b.status";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return query.getResultList();
    }

    @Override
    public List<Object[]> getOutstandingBills(String tenantId) {
        String jpql = "SELECT b.billNumber, b.patientName, b.createdAt, b.totalAmount, " +
                "b.paidAmount, b.balanceDue, DATEDIFF(CURRENT_DATE, b.createdAt) " +
                "FROM Bill b " +
                "WHERE b.tenantId = :tenantId " +
                "AND b.status = 'PENDING' " +
                "AND b.balanceDue > 0 " +
                "ORDER BY b.createdAt ASC";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        return query.getResultList();
    }

    @Override
    public List<Object[]> getUserActivity(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT u.username, u.firstName || ' ' || u.lastName, u.department, u.jobTitle, " +
                "COUNT(a.id), u.lastLoginAt, u.updatedAt " +
                "FROM UserProfile u " +
                "LEFT JOIN AuditLog a ON a.userId = u.id " +
                "WHERE u.tenantId = :tenantId " +
                "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
                "AND (:endDate IS NULL OR a.timestamp <= :endDate) " +
                "GROUP BY u.id, u.username, u.firstName, u.lastName, u.department, u.jobTitle, u.lastLoginAt, u.updatedAt";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return query.getResultList();
    }

    // User-specific billing methods
    @Override
    public List<Object[]> getUserBills(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT b.billNumber, b.totalAmount, b.patientName, b.status " +
                "FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.createdBy = :username " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
                "ORDER BY b.createdAt DESC";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return query.getResultList();
    }

    @Override
    public Double getUserRevenue(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.createdBy = :username " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).doubleValue() : 0.0;
    }

    @Override
    public Long getUserBillCount(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.createdBy = :username " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return ((Number) query.getSingleResult()).longValue();
    }

    // User-specific queue methods
    @Override
    public List<Object[]> getUserQueueItems(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT q.id, q.priority, p.firstName || ' ' || p.lastName, q.currentStatus, q.departmentId " +
                "FROM VisitQueueItem q " +
                "JOIN q.patient p " +
                "WHERE q.tenantId = :tenantId " +
                "AND q.currentAssigneeId = :username " +
                "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR q.createdAt <= :endDate) " +
                "ORDER BY q.createdAt DESC";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return query.getResultList();
    }

    @Override
    public Long getUserQueueCount(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(q) FROM VisitQueueItem q WHERE q.tenantId = :tenantId " +
                "AND q.currentAssigneeId = :username " +
                "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR q.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return ((Number) query.getSingleResult()).longValue();
    }

    // User-specific activity methods
    @Override
    public List<Object[]> getUserActivityForUser(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT a.action, COUNT(a), a.timestamp, a.endpoint " +
                "FROM AuditLog a WHERE a.tenantId = :tenantId " +
                "AND a.username = :username " +
                "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
                "AND (:endDate IS NULL OR a.timestamp <= :endDate) " +
                "GROUP BY a.action, a.timestamp, a.endpoint " +
                "ORDER BY a.timestamp DESC";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return query.getResultList();
    }

    @Override
    public Long getUserTotalActions(String tenantId, String username, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId " +
                "AND a.username = :username " +
                "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
                "AND (:endDate IS NULL OR a.timestamp <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        query.setParameter("username", username);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public Long getTotalPendingBills(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.status = 'PENDING' " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return ((Number) query.getSingleResult()).longValue();
    }

    @Override
    public Long getTotalPaidBills(String tenantId, LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
                "AND b.status = 'PAID' " +
                "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
                "AND (:endDate IS NULL OR b.createdAt <= :endDate)";
        
        Query query = entityManager.createQuery(jpql);
        query.setParameter("tenantId", tenantId);
        
        if (startDate != null) {
            query.setParameter("startDate", startDate);
        } else {
            query.setParameter("startDate", null);
        }
        
        if (endDate != null) {
            query.setParameter("endDate", endDate);
        } else {
            query.setParameter("endDate", null);
        }
        
        return ((Number) query.getSingleResult()).longValue();
    }
}
