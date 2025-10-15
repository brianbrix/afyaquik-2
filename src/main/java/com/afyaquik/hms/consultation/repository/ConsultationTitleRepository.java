package com.afyaquik.hms.consultation.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationTitleRepository extends TenantAwareRepository<ConsultationTitle, Long> {
    boolean existsByTitle(String title);
}
