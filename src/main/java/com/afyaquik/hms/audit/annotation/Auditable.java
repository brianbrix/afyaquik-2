package com.afyaquik.hms.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods or classes that should be audited.
 * This allows for dynamic auditing without hardcoded path checks.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    
    /**
     * The action being performed (e.g., "CREATE_USER", "UPDATE_PATIENT")
     * If not specified, will be derived from the HTTP method and entity type
     */
    String action() default "";
    
    /**
     * The entity type being affected (e.g., "User", "Patient", "Appointment")
     * If not specified, will be derived from the class name or path
     */
    String entityType() default "";
    
    /**
     * The entity ID field name in the request body or path variable
     * Used to extract the entity ID for audit logging
     */
    String entityIdField() default "id";
    
    /**
     * Whether this operation should be audited even for GET requests
     * Default is false (GET requests are usually not audited)
     */
    boolean auditGet() default false;
    
    /**
     * Custom description for the audit log
     */
    String description() default "";
    
    /**
     * Whether to include request body in the audit log
     */
    boolean includeRequestBody() default true;
    
    /**
     * Whether to include response body in the audit log
     */
    boolean includeResponseBody() default false;
}
