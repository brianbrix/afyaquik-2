package com.afyaquik.hms.admin.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Represents a currency configuration for the system.
 */
@Entity
@Table(name = "currencies")
public class Currency extends BaseEntity {

    @Column(name = "code", nullable = false, length = 3, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "decimal_places", nullable = false)
    private Integer decimalPlaces = 2;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Currency() {}

    public Currency(String code, String name, String symbol, Boolean isDefault) {
        this.code = code;
        this.name = name;
        this.symbol = symbol;
        this.isDefault = isDefault;
    }

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Integer getDecimalPlaces() {
        return decimalPlaces;
    }

    public void setDecimalPlaces(Integer decimalPlaces) {
        this.decimalPlaces = decimalPlaces;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
