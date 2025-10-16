package com.afyaquik.hms.admin.dto;

import java.time.Instant;

/**
 * Data Transfer Object for Currency.
 */
public class CurrencyDto {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Boolean isDefault;
    private Integer decimalPlaces;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public CurrencyDto() {}

    public CurrencyDto(Long id, String code, String name, String symbol, Boolean isDefault, 
                      Integer decimalPlaces, Boolean isActive, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.symbol = symbol;
        this.isDefault = isDefault;
        this.decimalPlaces = decimalPlaces;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

