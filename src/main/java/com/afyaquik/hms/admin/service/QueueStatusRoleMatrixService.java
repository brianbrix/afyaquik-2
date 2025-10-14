
package com.afyaquik.hms.admin.service;

import com.afyaquik.hms.admin.entity.QueueStatusRoleVisibility;
import com.afyaquik.hms.admin.repository.QueueStatusRoleVisibilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class QueueStatusRoleMatrixService {
    private final QueueStatusRoleVisibilityRepository repository;

    public QueueStatusRoleMatrixService(QueueStatusRoleVisibilityRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Map<String, Set<String>> getMatrix() {
        Map<String, Set<String>> matrix = new HashMap<>();
        for (QueueStatusRoleVisibility entry : repository.findAll()) {
            matrix.computeIfAbsent(entry.getRoleKey(), k -> new HashSet<>()).add(entry.getQueueStatus());
        }
        return matrix;
    }

    @Transactional
    public void setMatrix(Map<String, List<String>> matrix) {
        // For each role, delete all existing records for that role, then insert new deduplicated ones
        for (Map.Entry<String, List<String>> entry : matrix.entrySet()) {
            String role = entry.getKey();
            List<String> statuses = entry.getValue();
            repository.deleteByRoleKey(role);
            repository.flush(); // Ensure delete is executed before insert
            Set<String> uniqueStatuses = new HashSet<>(statuses); // Deduplicate
            List<QueueStatusRoleVisibility> entities = new ArrayList<>();
            for (String status : uniqueStatuses) {
                entities.add(new QueueStatusRoleVisibility(role, status));
            }
            repository.saveAll(entities);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getAllStatuses() {
        return Arrays.asList(
            "PENDING_CHECKIN","IN_REGISTRATION","WAITING_TRIAGE","IN_TRIAGE","WAITING_PROVIDER","IN_CONSULT","WAITING_DIAGNOSTICS","IN_DIAGNOSTICS","WAITING_PHARMACY","IN_PHARMACY","WAITING_BILLING","IN_BILLING","BLOCKED","NO_SHOW","CANCELLED","CLOSED"
        );
    }
}
