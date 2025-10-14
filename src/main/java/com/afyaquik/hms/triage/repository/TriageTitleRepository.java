package com.afyaquik.hms.triage.repository;

import com.afyaquik.hms.triage.domain.TriageTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriageTitleRepository extends JpaRepository<TriageTitle, Long> {
    boolean existsByTitle(String title);
    boolean existsByTitleAndTenantId(String title, String tenantId);
}
