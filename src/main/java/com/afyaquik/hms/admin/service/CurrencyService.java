package com.afyaquik.hms.admin.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.admin.domain.Currency;
import com.afyaquik.hms.admin.dto.CurrencyDto;
import com.afyaquik.hms.admin.dto.CurrencyRequest;
import com.afyaquik.hms.admin.repository.CurrencyRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

/**
 * Service for managing currencies.
 */
@Service
@Transactional
public class CurrencyService {
    private static final Logger log = LoggerFactory.getLogger(CurrencyService.class);

    @Autowired
    private CurrencyRepository currencyRepository;

    /**
     * Get all active currencies for the current tenant.
     */
    @Transactional(readOnly = true)
    public List<CurrencyDto> getAllActiveCurrencies() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting all active currencies for tenant: {}", tenantId);
        
        List<Currency> currencies = currencyRepository.findByTenantIdAndActiveOrderByDefaultAndName(tenantId);
        return currencies.stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Get all currencies for the current tenant (including inactive).
     */
    @Transactional(readOnly = true)
    public List<CurrencyDto> getAllCurrencies() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting all currencies for tenant: {}", tenantId);
        
        List<Currency> currencies = currencyRepository.findByTenantIdOrderByDefaultAndName(tenantId);
        return currencies.stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Get the default currency for the current tenant.
     */
    @Transactional(readOnly = true)
    public CurrencyDto getDefaultCurrency() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting default currency for tenant: {}", tenantId);
        
        Optional<Currency> currency = currencyRepository.findDefaultByTenantId(tenantId);
        if (currency.isPresent()) {
            return convertToDto(currency.get());
        }
        
        // If no default currency found, return a fallback
        return new CurrencyDto(null, "KES", "Kenyan Shilling", "Ksh", true, 2, true, null, null);
    }

    /**
     * Get currency by ID.
     */
    @Transactional(readOnly = true)
    public CurrencyDto getCurrencyById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting currency by ID: {} for tenant: {}", id, tenantId);
        
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));
        
        if (!currency.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to currency in another tenant");
        }
        
        return convertToDto(currency);
    }

    /**
     * Create a new currency.
     */
    public CurrencyDto createCurrency(CurrencyRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Creating currency: {} for tenant: {}", request.getCode(), tenantId);
        
        // Check if currency code already exists
        if (currencyRepository.existsByTenantIdAndCodeAndIdNot(tenantId, request.getCode(), null)) {
            throw new RuntimeException("Currency code already exists: " + request.getCode());
        }
        
        // If this is set as default, unset other defaults
        if (request.getIsDefault()) {
            unsetOtherDefaults(tenantId);
        }
        
        Currency currency = new Currency();
        currency.setTenantId(tenantId);
        currency.setCode(request.getCode().toUpperCase());
        currency.setName(request.getName());
        currency.setSymbol(request.getSymbol());
        currency.setIsDefault(request.getIsDefault());
        currency.setDecimalPlaces(request.getDecimalPlaces());
        currency.setIsActive(request.getIsActive());
        
        Currency savedCurrency = currencyRepository.save(currency);
        return convertToDto(savedCurrency);
    }

    /**
     * Update an existing currency.
     */
    public CurrencyDto updateCurrency(Long id, CurrencyRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating currency: {} for tenant: {}", id, tenantId);
        
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));
        
        if (!currency.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to currency in another tenant");
        }
        
        // Check if currency code already exists (excluding current currency)
        if (currencyRepository.existsByTenantIdAndCodeAndIdNot(tenantId, request.getCode(), id)) {
            throw new RuntimeException("Currency code already exists: " + request.getCode());
        }
        
        // If this is set as default, unset other defaults
        if (request.getIsDefault() && !currency.getIsDefault()) {
            unsetOtherDefaults(tenantId);
        }
        
        currency.setCode(request.getCode().toUpperCase());
        currency.setName(request.getName());
        currency.setSymbol(request.getSymbol());
        currency.setIsDefault(request.getIsDefault());
        currency.setDecimalPlaces(request.getDecimalPlaces());
        currency.setIsActive(request.getIsActive());
        
        Currency savedCurrency = currencyRepository.save(currency);
        return convertToDto(savedCurrency);
    }

    /**
     * Delete a currency.
     */
    public void deleteCurrency(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Deleting currency: {} for tenant: {}", id, tenantId);
        
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));
        
        if (!currency.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to currency in another tenant");
        }
        
        // Don't allow deletion of default currency
        if (currency.getIsDefault()) {
            throw new RuntimeException("Cannot delete the default currency");
        }
        
        currency.softDelete();
        currencyRepository.save(currency);
    }

    /**
     * Set a currency as default.
     */
    public CurrencyDto setDefaultCurrency(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Setting currency as default: {} for tenant: {}", id, tenantId);
        
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));
        
        if (!currency.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to currency in another tenant");
        }
        
        // Unset other defaults
        unsetOtherDefaults(tenantId);
        
        // Set this as default
        currency.setIsDefault(true);
        currency.setIsActive(true);
        
        Currency savedCurrency = currencyRepository.save(currency);
        return convertToDto(savedCurrency);
    }

    /**
     * Unset other default currencies for the tenant.
     */
    private void unsetOtherDefaults(String tenantId) {
        List<Currency> defaultCurrencies = currencyRepository.findByTenantIdAndActiveOrderByDefaultAndName(tenantId)
                .stream()
                .filter(Currency::getIsDefault)
                .toList();
        
        for (Currency currency : defaultCurrencies) {
            currency.setIsDefault(false);
            currencyRepository.save(currency);
        }
    }

    /**
     * Convert Currency entity to DTO.
     */
    private CurrencyDto convertToDto(Currency currency) {
        return new CurrencyDto(
                currency.getId(),
                currency.getCode(),
                currency.getName(),
                currency.getSymbol(),
                currency.getIsDefault(),
                currency.getDecimalPlaces(),
                currency.getIsActive(),
                currency.getCreatedAt(),
                currency.getUpdatedAt()
        );
    }
}
