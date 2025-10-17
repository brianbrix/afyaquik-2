package com.afyaquik.hms.auth.config;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.repository.SuperAdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuperAdminDataSeeder implements CommandLineRunner {

    private final SuperAdminUserRepository superAdminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultSuperAdmin();
    }

    private void createDefaultSuperAdmin() {
        // Check if any super admin users exist
        if (superAdminUserRepository.count() > 0) {
            log.info("Super admin users already exist, skipping default creation");
            return;
        }

        // Create default super admin user
        SuperAdminUser superAdmin = new SuperAdminUser();
        superAdmin.setUsername("superadmin");
        superAdmin.setDisplayName("System Super Administrator");
        superAdmin.setEmail("superadmin@system.local");
        superAdmin.setPasswordHash(passwordEncoder.encode("SuperAdmin123!"));
        superAdmin.setIsActive(true);
        superAdmin.setNotes("Default system super administrator account");

        superAdminUserRepository.save(superAdmin);
        
        log.info("Created default super admin user: superadmin");
        log.info("Default credentials: username=superadmin, password=SuperAdmin123!");
        log.warn("IMPORTANT: Change the default password after first login!");
    }
}
