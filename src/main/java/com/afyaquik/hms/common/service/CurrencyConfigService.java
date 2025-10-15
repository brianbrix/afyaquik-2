package com.afyaquik.hms.common.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.admin.domain.Currency;
import com.afyaquik.hms.admin.repository.CurrencyRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

/**
 * Service for getting currency configuration for the current tenant.
 */
@Service
@Transactional(readOnly = true)
public class CurrencyConfigService {
    private static final Logger log = LoggerFactory.getLogger(CurrencyConfigService.class);

    @Autowired
    private CurrencyRepository currencyRepository;

    /**
     * Get the default currency for the current tenant.
     * This is cached for performance.
     */
    @Cacheable(value = "currency", key = "#tenantId")
    public Currency getDefaultCurrency(String tenantId) {
        log.debug("Getting default currency for tenant: {}", tenantId);
        
        return currencyRepository.findDefaultByTenantId(tenantId)
                .orElseGet(() -> {
                    // Return a fallback currency if none is configured
                    Currency fallback = new Currency();
                    fallback.setCode("USD");
                    fallback.setName("US Dollar");
                    fallback.setSymbol("$");
                    fallback.setDecimalPlaces(2);
                    fallback.setIsDefault(true);
                    fallback.setIsActive(true);
                    return fallback;
                });
    }

    /**
     * Get the default currency for the current tenant.
     */
    public Currency getCurrentDefaultCurrency() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return getDefaultCurrency(tenantId);
    }

    /**
     * Format a number as currency using the default currency.
     */
    public String formatCurrency(Double amount) {
        if (amount == null) {
            return "0.00";
        }
        
        Currency currency = getCurrentDefaultCurrency();
        return formatCurrency(amount, currency);
    }

    /**
     * Format a number as currency using the specified currency.
     */
    public String formatCurrency(Double amount, Currency currency) {
        if (amount == null) {
            return "0.00";
        }
        
        if (currency == null) {
            return String.format("%.2f", amount);
        }
        
        String pattern = "%." + currency.getDecimalPlaces() + "f";
        return currency.getSymbol() + String.format(pattern, amount);
    }

    /**
     * Format a number as currency using the default currency symbol and decimal places.
     */
    public String formatCurrency(Double amount, String symbol, Integer decimalPlaces) {
        if (amount == null) {
            return "0.00";
        }
        
        String pattern = "%." + (decimalPlaces != null ? decimalPlaces : 2) + "f";
        return (symbol != null ? symbol : "$") + String.format(pattern, amount);
    }
}
