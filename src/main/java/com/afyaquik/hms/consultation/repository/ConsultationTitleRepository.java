package com.afyaquik.hms.consultation.repository;

import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationTitleRepository extends JpaRepository<ConsultationTitle, Long> {
    boolean existsByTitle(String title);
}
