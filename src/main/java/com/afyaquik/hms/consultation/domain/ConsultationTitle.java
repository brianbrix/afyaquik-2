package com.afyaquik.hms.consultation.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "consultation_title")
public class ConsultationTitle extends BaseEntity {
    @Column(nullable = false)
    private String title;

    @Column(name = "level", nullable = false)
    private Integer level = 1;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ConsultationTitle parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private List<ConsultationTitle> children;

    public ConsultationTitle() {}
    
    public ConsultationTitle(String title) { 
        this.title = title; 
    }
    
    public ConsultationTitle(String title, Integer level, ConsultationTitle parent) { 
        this.title = title; 
        this.level = level;
        this.parent = parent;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public ConsultationTitle getParent() { return parent; }
    public void setParent(ConsultationTitle parent) { this.parent = parent; }

    public List<ConsultationTitle> getChildren() { return children; }
    public void setChildren(List<ConsultationTitle> children) { this.children = children; }
}
