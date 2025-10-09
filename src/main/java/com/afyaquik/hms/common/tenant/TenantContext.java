package com.afyaquik.hms.common.tenant;

/**
 * Simple ThreadLocal holder for the current request tenant id. This allows service-layer
 * code to optionally resolve tenant context without threading the tenantId through every method.
 * Existing code that passes tenantId explicitly can remain; this is additive.
 */
public final class TenantContext {
    private static final ThreadLocal<String> TENANT = new InheritableThreadLocal<>();

    private TenantContext() {}

    public static void setTenantId(String tenantId) { TENANT.set(tenantId); }

    public static String getTenantId() { return TENANT.get(); }

    public static void clear() { TENANT.remove(); }
}
