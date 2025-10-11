package com.afyaquik.hms.auth.config;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.PermissionAssignmentRepository;
import com.afyaquik.hms.auth.repository.PermissionRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Optional;

@Configuration
public class DefaultAdminPermissionSeeder {
    @Value("${afyaquik.default-admin.username:admin}")
    private String defaultAdminUsername;
    @Value("${afyaquik.default-admin.tenant:default}")
    private String defaultTenantId;

    @Bean
    public CommandLineRunner seedAdminPermissions(
            StaffUserRepository staffUserRepository,
            PermissionRepository permissionRepository,
            PermissionAssignmentRepository assignmentRepository
    ) {
        return args -> {
            Optional<StaffUser> adminOpt = staffUserRepository.findByTenantIdAndUsername(defaultTenantId, defaultAdminUsername);
            if (adminOpt.isEmpty()) return;
            StaffUser admin = adminOpt.get();
            List<Permission> allPerms = permissionRepository.findAll();
            for (Permission perm : allPerms) {
                boolean exists = assignmentRepository.findByPermission_CodeAndTargetTypeAndTargetId(
                        perm.getCode(), PermissionAssignment.TargetType.USER, admin.getId()
                ).stream().anyMatch(a -> a.getState() == PermissionAssignment.State.ALLOWED);
                if (!exists) {
                    PermissionAssignment pa = new PermissionAssignment(
                            PermissionAssignment.TargetType.USER,
                            admin.getId(),
                            perm,
                            PermissionAssignment.State.ALLOWED
                    );
                    assignmentRepository.save(pa);
                }
            }
        };
    }
}
