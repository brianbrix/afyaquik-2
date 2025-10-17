package com.afyaquik.hms.auth.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.repository.PermissionRepository;

@Configuration
public class PermissionSeeder {
    @Bean
    public CommandLineRunner seedPermissions(PermissionRepository permissionRepository) {
        return args -> {
            List<Permission> permissions = List.of(
                new Permission("CREATE_PATIENT", "Create a new patient record"),
                new Permission("EDIT_PATIENT", "Edit patient details"),
                new Permission("VIEW_PATIENT", "View patient details"),
                new Permission("VIEW_PATIENT_REPORTS", "View patient reports"),
                new Permission("VIEW_PATIENTS", "View patients"),
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
                new Permission("MANAGE_BILLING", "Manage billing and payments"),
                new Permission("VIEW_BILLING", "View billing information"),
                new Permission("MANAGE_SETTINGS", "Manage system settings"),
                new Permission("MANAGE_PERMISSIONS", "Manage permissions"),
                new Permission("MANAGE_SHIFT_TYPES", "Manage Shift Types"),
                new Permission("MANAGE_GROUPS", "Manage groups"),
                new Permission("MANAGE_ROLES", "Manage roles"),
                new Permission("MANAGE_USERS", "Administer users"),
                new Permission("MANAGE_REDIRECTS", "Manage login redirects"),
                new Permission("VIEW_DASHBOARD", "View dashboard"),
                new Permission("VIEW_REFERENCE_DATA", "View reference data"),
                new Permission("EDIT_REFERENCE_DATA", "Edit reference data"),
                new Permission("VIEW_PHARMACY", "View pharmacy"),
                new Permission("MANAGE_PHARMACY_INVENTORY", "Manage pharmacy inventory"),
                new Permission("MANAGE_PHARMACY_MEDICATIONS", "Manage pharmacy MEDICATIONS"),
                new Permission("VIEW_PHARMACY_INVENTORY", "View pharmacy inventory"),
                new Permission("MANAGE_PHARMACY_INVENTORY", "Manage pharmacy inventory"),
                new Permission("MANAGE_PRESCRIPTIONS", "Dispense medication"),
                new Permission("VIEW_PRESCRIPTIONS", "View prescriptions"),
                new Permission("VIEW_PATIENT_NOTES", "View patient notes"),
                new Permission("MANAGE_DIAGNOSTICS", "Manage diagnostics"),
                new Permission("MANAGE_REGISTRATION", "Manage patient registration"),
                new Permission("MANAGE_TRIAGE", "Manage patient triage"),
                new Permission("MANAGE_CONSULTATIONS", "Manage patient consultation"),
                new Permission("MANAGE_PHARMACY", "Manage pharmacy"),
                new Permission("MANAGE_LAB", "Manage laboratory"),
                new Permission("MANAGE_BILLING", "Manage billing"),
                // Medication Inventory Permissions
                new Permission("MANAGE_MEDICATION_INVENTORY", "Manage medication inventory"),
                new Permission("VIEW_MEDICATION_INVENTORY", "View medication inventory"),
                // Team Management Permissions
                new Permission("MANAGE_TEAM", "Manage team members and requests"),
                new Permission("VIEW_TEAM", "View team information"),
                new Permission("APPROVE_TIME_OFF", "Approve time-off requests"),
                new Permission("APPROVE_SHIFT_SWAPS", "Approve shift swap requests"),
                new Permission("VIEW_ANALYTICS", "View analytics"),
                new Permission("VIEW_AUDIT_LOGS", "View audit logs"),
                new Permission("VIEW_ADMIN_SETTINGS", "View admin settings"),
                new Permission("MANAGE_ADMIN_SETTINGS", "Manage admin settings"),
                new Permission("MANAGE_MEDICATIONS", "Manage medications"),
                new Permission("VIEW_ALL_CLOSED_QUEUE_ITEMS", "View all closed queue items"),
                new Permission("VIEW_OPERATIONS", "View operations"),
                new Permission("VIEW_ALL_APPOINTMENTS", "View all appointments"),
                new Permission("CREATE_APPOINTMENT", "Create an appointment"),
                new Permission("EDIT_APPOINTMENT", "Edit appointment details")
            );
            for (Permission p : permissions) {
                p.setTenantId("clinic-a");
                permissionRepository.findByCode(p.getCode()).orElseGet(() -> permissionRepository.save(p));
            }
        };
    }
}
