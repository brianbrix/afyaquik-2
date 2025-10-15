package com.afyaquik.hms.billing.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.afyaquik.hms.billing.domain.BillingItem;
import com.afyaquik.hms.billing.domain.BillingItemCategory;
import com.afyaquik.hms.billing.repository.BillingItemCategoryRepository;
import com.afyaquik.hms.billing.repository.BillingItemRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Component
@Order(100)
public class BillingDataSeeder implements CommandLineRunner {

    @Autowired
    private BillingItemCategoryRepository billingItemCategoryRepository;

    @Autowired
    private BillingItemRepository billingItemRepository;

    @Override
    public void run(String... args) throws Exception {
        String tenantId = "default"; // Default tenant for seeding
        
        // Create Pharmacy category if it doesn't exist
        if (!billingItemCategoryRepository.findByTenantIdAndCategoryNameAndDeletedFalse(tenantId, "Pharmacy").isPresent()) {
            BillingItemCategory pharmacyCategory = new BillingItemCategory();
            pharmacyCategory.setTenantId(tenantId);
            pharmacyCategory.setCategoryName("Pharmacy");
            pharmacyCategory.setDescription("Pharmacy services and medications");
            pharmacyCategory.setIsActive(true);
            billingItemCategoryRepository.save(pharmacyCategory);
            
            System.out.println("Created Pharmacy billing item category");
        }

        // Create Pharmacy billing item if it doesn't exist
        if (!billingItemRepository.findByTenantIdAndItemCodeAndDeletedFalse(tenantId, "PHARMACY-001").isPresent()) {
            BillingItem pharmacyItem = new BillingItem();
            pharmacyItem.setTenantId(tenantId);
            pharmacyItem.setItemCode("PHARMACY-001");
            pharmacyItem.setDescription("Pharmacy Services");
            pharmacyItem.setUnitPrice(BigDecimal.valueOf(0.00)); // Will be set based on actual medication prices
            pharmacyItem.setServiceCategory("PHARMACY");
            pharmacyItem.setIsActive(true);
            billingItemRepository.save(pharmacyItem);
            
            System.out.println("Created Pharmacy billing item");
        }
    }
}
