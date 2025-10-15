package com.afyaquik.hms.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for Currency operations.
 */
public class CurrencyRequest {

    @NotBlank(message = "Currency code is required")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    private String code;

    @NotBlank(message = "Currency name is required")
    @Size(max = 100, message = "Currency name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Currency symbol is required")
    @Size(max = 10, message = "Currency symbol must not exceed 10 characters")
    private String symbol;

    @NotNull(message = "Default status is required")
    private Boolean isDefault;

    @NotNull(message = "Decimal places is required")
    private Integer decimalPlaces;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // Constructors
    public CurrencyRequest() {}

    public CurrencyRequest(String code, String name, String symbol, Boolean isDefault, 
                          Integer decimalPlaces, Boolean isActive) {
        this.code = code;
        this.name = name;
        this.symbol = symbol;
        this.isDefault = isDefault;
        this.decimalPlaces = decimalPlaces;
        this.isActive = isActive;
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
