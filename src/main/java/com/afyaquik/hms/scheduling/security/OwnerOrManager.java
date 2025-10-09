package com.afyaquik.hms.scheduling.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Allows access if the authenticated user is the shift owner OR a scheduling manager (ADMIN, RECEPTION, SCHEDULING_MANAGER).
 * Usage: @OwnerOrManager on controller methods with a path variable named 'shiftId'.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@staffShiftSecurity.canRequestSwap(#shiftId, authentication)")
public @interface OwnerOrManager {
}
