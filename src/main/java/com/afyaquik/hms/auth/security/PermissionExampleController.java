package com.afyaquik.hms.auth.security;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Example controller demonstrating how to use the custom permission evaluator
 * with @PreAuthorize annotations that work with our resolved permissions system.
 */
@RestController
@RequestMapping("/api/v1/examples")
public class PermissionExampleController {

    /**
     * Example endpoint that requires MANAGE_BILLING permission.
     * This will use our CustomPermissionEvaluator to check if the user has
     * the MANAGE_BILLING permission based on their resolved permissions
     * (User > Group > Role hierarchy).
     */
    @GetMapping("/billing-management")
    @PreAuthorize("hasPermission('MANAGE_BILLING')")
    public String billingManagement() {
        return "You have MANAGE_BILLING permission!";
    }

    /**
     * Example endpoint that requires VIEW_BILLING permission.
     */
    @GetMapping("/billing-view")
    @PreAuthorize("hasPermission('VIEW_BILLING')")
    public String billingView() {
        return "You have VIEW_BILLING permission!";
    }

    /**
     * Example endpoint that requires multiple permissions (both must be granted).
     */
    @GetMapping("/billing-full-access")
    @PreAuthorize("hasPermission('MANAGE_BILLING') and hasPermission('VIEW_BILLING')")
    public String billingFullAccess() {
        return "You have both MANAGE_BILLING and VIEW_BILLING permissions!";
    }

    /**
     * Example endpoint that requires either permission (at least one must be granted).
     */
    @GetMapping("/billing-any-access")
    @PreAuthorize("hasPermission('MANAGE_BILLING') or hasPermission('VIEW_BILLING')")
    public String billingAnyAccess() {
        return "You have at least one billing permission!";
    }
}
