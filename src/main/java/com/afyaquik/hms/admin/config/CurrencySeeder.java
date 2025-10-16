package com.afyaquik.hms.admin.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.afyaquik.hms.admin.domain.Currency;
import com.afyaquik.hms.admin.repository.CurrencyRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

/**
 * Seeder for default currencies.
 */
@Component
@Order(3)
public class CurrencySeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(CurrencySeeder.class);

    @Autowired
    private CurrencyRepository currencyRepository;

    @Override
    public void run(String... args) throws Exception {
        String tenantId = "default"; // Default tenant
        
        // Check if currencies already exist for this tenant
        if (currencyRepository.findByTenantIdAndActiveOrderByDefaultAndName(tenantId).isEmpty()) {
            log.info("Seeding default currencies for tenant: {}", tenantId);
            seedDefaultCurrencies(tenantId);
        } else {
            log.info("Currencies already exist for tenant: {}", tenantId);
        }
    }

    private void seedDefaultCurrencies(String tenantId) {
        // USD - US Dollar (Default)
        Currency usd = new Currency();
        usd.setTenantId(tenantId);
        usd.setCode("USD");
        usd.setName("US Dollar");
        usd.setSymbol("$");
        usd.setIsDefault(true);
        usd.setDecimalPlaces(2);
        usd.setIsActive(true);
        currencyRepository.save(usd);

        // KES - Kenyan Shilling
        Currency kes = new Currency();
        kes.setTenantId(tenantId);
        kes.setCode("KES");
        kes.setName("Kenyan Shilling");
        kes.setSymbol("KSh");
        kes.setIsDefault(false);
        kes.setDecimalPlaces(2);
        kes.setIsActive(true);
        currencyRepository.save(kes);

        // EUR - Euro
        Currency eur = new Currency();
        eur.setTenantId(tenantId);
        eur.setCode("EUR");
        eur.setName("Euro");
        eur.setSymbol("€");
        eur.setIsDefault(false);
        eur.setDecimalPlaces(2);
        eur.setIsActive(true);
        currencyRepository.save(eur);

        // GBP - British Pound
        Currency gbp = new Currency();
        gbp.setTenantId(tenantId);
        gbp.setCode("GBP");
        gbp.setName("British Pound");
        gbp.setSymbol("£");
        gbp.setIsDefault(false);
        gbp.setDecimalPlaces(2);
        gbp.setIsActive(true);
        currencyRepository.save(gbp);

        log.info("Successfully seeded default currencies for tenant: {}", tenantId);
    }
}

