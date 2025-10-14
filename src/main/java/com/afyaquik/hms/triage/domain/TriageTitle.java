package com.afyaquik.hms.triage.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.fasterxml.jackson.databind.JsonSerializable.Base;

import jakarta.persistence.*;

@Entity
@Table(name = "triage_titles")
public class TriageTitle extends BaseEntity {


    @Column(nullable = false, unique = true)
    private String title;

    public TriageTitle() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
