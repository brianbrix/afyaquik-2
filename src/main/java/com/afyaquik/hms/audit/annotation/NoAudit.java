package com.afyaquik.hms.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods or classes that should NOT be audited.
 * This takes precedence over @Auditable annotation.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoAudit {
    
    /**
     * Reason why this method/class is not audited
     */
    String reason() default "";
}
