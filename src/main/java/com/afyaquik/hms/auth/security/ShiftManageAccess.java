package com.afyaquik.hms.auth.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Meta-annotation centralizing authorization for managing staff shifts.
 * Only administrators, reception, or designated scheduling managers may
 * create, update, or approve (swap) shifts.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('ADMIN','RECEPTION','SCHEDULING_MANAGER')")
public @interface ShiftManageAccess {
}
