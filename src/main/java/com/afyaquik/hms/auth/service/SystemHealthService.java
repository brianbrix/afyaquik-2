package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.repository.TenantRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.repository.SuperAdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemHealthService {

    private final TenantRepository tenantRepository;
    private final StaffUserRepository staffUserRepository;
    private final SuperAdminUserRepository superAdminUserRepository;

    /**
     * Get system health metrics
     */
    public SystemHealthMetrics getSystemHealth() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();

        // Memory metrics
        long totalMemory = memoryBean.getHeapMemoryUsage().getMax();
        long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
        long freeMemory = totalMemory - usedMemory;
        double memoryUsagePercent = (double) usedMemory / totalMemory * 100;

        // Runtime metrics
        long uptime = runtimeBean.getUptime();
        int availableProcessors = ManagementFactory.getOperatingSystemMXBean().getAvailableProcessors();

        // Database metrics
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countActiveTenants();
        long totalUsers = staffUserRepository.count();
        long activeUsers = staffUserRepository.count(); // TODO: Add countByIsActiveTrue method
        long superAdmins = superAdminUserRepository.count();

        return new SystemHealthMetrics(
            SystemHealthStatus.HEALTHY, // TODO: Implement actual health checks
            totalMemory,
            usedMemory,
            freeMemory,
            memoryUsagePercent,
            uptime,
            availableProcessors,
            totalTenants,
            activeTenants,
            totalUsers,
            activeUsers,
            superAdmins,
            LocalDateTime.now()
        );
    }

    /**
     * Get system performance metrics
     */
    public SystemPerformanceMetrics getSystemPerformance() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();

        // JVM metrics
        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
        long heapMax = memoryBean.getHeapMemoryUsage().getMax();
        long nonHeapUsed = memoryBean.getNonHeapMemoryUsage().getUsed();
        long nonHeapMax = memoryBean.getNonHeapMemoryUsage().getMax();

        // GC metrics
        long gcCount = ManagementFactory.getGarbageCollectorMXBeans().stream()
                .mapToLong(gc -> gc.getCollectionCount())
                .sum();

        long gcTime = ManagementFactory.getGarbageCollectorMXBeans().stream()
                .mapToLong(gc -> gc.getCollectionTime())
                .sum();

        return new SystemPerformanceMetrics(
            heapUsed,
            heapMax,
            nonHeapUsed,
            nonHeapMax,
            gcCount,
            gcTime,
            runtimeBean.getUptime(),
            ManagementFactory.getThreadMXBean().getThreadCount(),
            ManagementFactory.getThreadMXBean().getPeakThreadCount()
        );
    }

    /**
     * Get database statistics
     */
    public DatabaseStats getDatabaseStats() {
        return new DatabaseStats(
            tenantRepository.count(),
            tenantRepository.countActiveTenants(),
            staffUserRepository.count(),
            staffUserRepository.count(), // TODO: Add countByIsActiveTrue method
            superAdminUserRepository.count()
        );
    }

    public enum SystemHealthStatus {
        HEALTHY,
        WARNING,
        CRITICAL,
        DOWN
    }

    public record SystemHealthMetrics(
        SystemHealthStatus status,
        long totalMemory,
        long usedMemory,
        long freeMemory,
        double memoryUsagePercent,
        long uptime,
        int availableProcessors,
        long totalTenants,
        long activeTenants,
        long totalUsers,
        long activeUsers,
        long superAdmins,
        LocalDateTime timestamp
    ) {}

    public record SystemPerformanceMetrics(
        long heapUsed,
        long heapMax,
        long nonHeapUsed,
        long nonHeapMax,
        long gcCount,
        long gcTime,
        long uptime,
        int threadCount,
        int peakThreadCount
    ) {}

    public record DatabaseStats(
        long totalTenants,
        long activeTenants,
        long totalUsers,
        long activeUsers,
        long superAdmins
    ) {}
}
