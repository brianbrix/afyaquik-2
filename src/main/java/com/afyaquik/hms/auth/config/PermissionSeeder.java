package com.afyaquik.hms.auth.config;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.repository.PermissionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class PermissionSeeder {
    @Bean
    public CommandLineRunner seedPermissions(PermissionRepository permissionRepository) {
        return args -> {
            List<Permission> permissions = List.of(
                new Permission("CREATE_PATIENT", "Create a new patient record"),
                new Permission("EDIT_PATIENT", "Edit patient details"),
                new Permission("VIEW_PATIENT", "View patient details"),
                new Permission("DELETE_PATIENT", "Delete a patient record"),
                new Permission("MERGE_PATIENT", "Merge duplicate patient records"),
                new Permission("MANAGE_SHIFTS", "Manage staff shifts"),
                new Permission("CREATE_QUEUE", "Create a new queue"),
                new Permission("EDIT_QUEUE", "Edit queue details"),
                new Permission("VIEW_QUEUE", "View queue"),
                new Permission("DELETE_QUEUE", "Delete a queue"),
                new Permission("ASSIGN_QUEUE", "Assign queue to user"),
                new Permission("REASSIGN_QUEUE", "Reassign queue to another user"),
                new Permission("CREATE_APPOINTMENT", "Create an appointment"),
                new Permission("EDIT_APPOINTMENT", "Edit appointment details"),
                new Permission("VIEW_APPOINTMENT", "View appointment details"),
                new Permission("DELETE_APPOINTMENT", "Delete an appointment"),
                new Permission("CREATE_SCHEDULE", "Create a schedule"),
                new Permission("EDIT_SCHEDULE", "Edit schedule"),
                new Permission("VIEW_SCHEDULE", "View schedule"),
                new Permission("DELETE_SCHEDULE", "Delete schedule"),
                new Permission("CREATE_USER", "Create a user"),
                new Permission("EDIT_USER", "Edit user details"),
                new Permission("VIEW_USER", "View user details"),
                new Permission("DELETE_USER", "Delete a user"),
                new Permission("ASSIGN_ROLE", "Assign role to user"),
                new Permission("ASSIGN_GROUP", "Assign group to user"),
                new Permission("CREATE_GROUP", "Create a user group"),
                new Permission("EDIT_GROUP", "Edit user group"),
                new Permission("VIEW_GROUP", "View user group"),
                new Permission("DELETE_GROUP", "Delete user group"),
                new Permission("MANAGE_GROUP_MEMBERS", "Manage group members"),
                new Permission("CREATE_ROLE", "Create a role"),
                new Permission("EDIT_ROLE", "Edit role"),
                new Permission("VIEW_ROLE", "View role"),
                new Permission("DELETE_ROLE", "Delete role"),
                new Permission("VIEW_REPORTS", "View reports"),
                new Permission("EXPORT_REPORTS", "Export reports"),
                new Permission("CREATE_BILL", "Create a bill"),
                new Permission("EDIT_BILL", "Edit bill"),
                new Permission("VIEW_BILL", "View bill"),
                new Permission("DELETE_BILL", "Delete bill"),
                new Permission("MANAGE_SETTINGS", "Manage system settings"),
                new Permission("MANAGE_PERMISSIONS", "Manage permissions"),
                new Permission("MANAGE_SHIFT_TYPES", "Manage Shift Types"),
                new Permission("MANAGE_GROUPS", "Manage groups"),
                new Permission("MANAGE_ROLES", "Manage roles"),
                new Permission("MANAGE_USERS", "Administer users"),
                new Permission("MANAGE_REDIRECTS", "Manage login redirects"),
                new Permission("VIEW_DASHBOARD", "View dashboard"),
                new Permission("VIEW_REFERENCE_DATA", "View reference data"),
                new Permission("EDIT_REFERENCE_DATA", "Edit reference data")
            );
            for (Permission p : permissions) {
                permissionRepository.findByCode(p.getCode()).orElseGet(() -> permissionRepository.save(p));
            }
        };
    }
}
