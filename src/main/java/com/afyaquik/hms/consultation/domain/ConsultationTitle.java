package com.afyaquik.hms.consultation.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "consultation_title")
public class ConsultationTitle extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String title;

    public ConsultationTitle() {}
    public ConsultationTitle(String title) { this.title = title; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
