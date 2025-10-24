package com.afyaquik.hms.audit.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.afyaquik.hms.audit.dto.OfflineAuditEntryDto;

/**
 * Service for handling offline audit trail operations
 */
@Service
public class OfflineAuditService {
    
    private final Map<String, OfflineAuditEntryDto> offlineAuditStorage = new HashMap<>();
    
    /**
     * Sync offline audit entries to server storage
     */
    public Map<String, Object> syncOfflineEntries(List<OfflineAuditEntryDto> entries) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            int syncedCount = 0;
            int failedCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (OfflineAuditEntryDto entry : entries) {
                try {
                    // Validate entry
                    if (entry.getId() == null || entry.getUserId() == null || entry.getAction() == null) {
                        failedCount++;
                        errors.add("Invalid entry: missing required fields");
                        continue;
                    }
                    
                    // Store entry
                    offlineAuditStorage.put(entry.getId(), entry);
                    syncedCount++;
                    
                } catch (Exception e) {
                    failedCount++;
                    errors.add("Failed to sync entry " + entry.getId() + ": " + e.getMessage());
                }
            }
            
            result.put("success", true);
            result.put("totalEntries", entries.size());
            result.put("syncedEntries", syncedCount);
            result.put("failedEntries", failedCount);
            result.put("errors", errors);
            result.put("timestamp", LocalDateTime.now().toString());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get offline audit statistics
     */
    public Map<String, Object> getOfflineAuditStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            List<OfflineAuditEntryDto> allEntries = new ArrayList<>(offlineAuditStorage.values());
            
            // Basic statistics
            statistics.put("totalEntries", allEntries.size());
            statistics.put("offlineEntries", allEntries.stream()
                .mapToInt(entry -> Boolean.TRUE.equals(entry.getOffline()) ? 1 : 0)
                .sum());
            statistics.put("onlineEntries", allEntries.stream()
                .mapToInt(entry -> Boolean.FALSE.equals(entry.getOffline()) ? 1 : 0)
                .sum());
            
            // Success rate
            long successfulEntries = allEntries.stream()
                .mapToInt(entry -> Boolean.TRUE.equals(entry.getSuccess()) ? 1 : 0)
                .sum();
            double successRate = allEntries.size() > 0 ? (double) successfulEntries / allEntries.size() * 100 : 0;
            statistics.put("successRate", Math.round(successRate * 100.0) / 100.0);
            
            // Error rate
            double errorRate = 100 - successRate;
            statistics.put("errorRate", Math.round(errorRate * 100.0) / 100.0);
            
            // Top actions
            Map<String, Long> actionCounts = allEntries.stream()
                .collect(Collectors.groupingBy(OfflineAuditEntryDto::getAction, Collectors.counting()));
            
            List<Map<String, Object>> topActions = actionCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> actionInfo = new HashMap<>();
                    actionInfo.put("action", entry.getKey());
                    actionInfo.put("count", entry.getValue());
                    return actionInfo;
                })
                .collect(Collectors.toList());
            
            statistics.put("topActions", topActions);
            
            // Top users
            Map<String, Long> userCounts = allEntries.stream()
                .collect(Collectors.groupingBy(
                    entry -> entry.getUserId() + ":" + entry.getUsername(),
                    Collectors.counting()
                ));
            
            List<Map<String, Object>> topUsers = userCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    String[] parts = entry.getKey().split(":");
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", Long.parseLong(parts[0]));
                    userInfo.put("username", parts[1]);
                    userInfo.put("count", entry.getValue());
                    return userInfo;
                })
                .collect(Collectors.toList());
            
            statistics.put("topUsers", topUsers);
            
            // Recent entries (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            long recentEntries = allEntries.stream()
                .mapToInt(entry -> entry.getTimestamp().isAfter(yesterday) ? 1 : 0)
                .sum();
            statistics.put("recentEntries", recentEntries);
            
        } catch (Exception e) {
            statistics.put("error", e.getMessage());
        }
        
        return statistics;
    }
    
    /**
     * Get offline audit entries by user
     */
    public Map<String, Object> getOfflineAuditEntriesByUser(Long userId, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<OfflineAuditEntryDto> userEntries = offlineAuditStorage.values().stream()
                .filter(entry -> entry.getUserId().equals(userId))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
            
            int start = page * size;
            int end = Math.min(start + size, userEntries.size());
            
            List<OfflineAuditEntryDto> pagedEntries = userEntries.subList(start, end);
            
            result.put("success", true);
            result.put("entries", pagedEntries);
            result.put("totalCount", userEntries.size());
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) userEntries.size() / size));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get offline audit entries by date range
     */
    public Map<String, Object> getOfflineAuditEntriesByDateRange(
            String startDate, String endDate, int page, int size) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            List<OfflineAuditEntryDto> dateRangeEntries = offlineAuditStorage.values().stream()
                .filter(entry -> entry.getTimestamp().isAfter(start) && entry.getTimestamp().isBefore(end))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
            
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, dateRangeEntries.size());
            
            List<OfflineAuditEntryDto> pagedEntries = dateRangeEntries.subList(startIndex, endIndex);
            
            result.put("success", true);
            result.put("entries", pagedEntries);
            result.put("totalCount", dateRangeEntries.size());
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) dateRangeEntries.size() / size));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Export offline audit entries
     */
    public Map<String, Object> exportOfflineAuditEntries(
            String startDate, String endDate, Long userId, String format) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<OfflineAuditEntryDto> entries = new ArrayList<>(offlineAuditStorage.values());
            
            // Apply filters
            if (startDate != null && endDate != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
                LocalDateTime start = LocalDateTime.parse(startDate, formatter);
                LocalDateTime end = LocalDateTime.parse(endDate, formatter);
                
                entries = entries.stream()
                    .filter(entry -> entry.getTimestamp().isAfter(start) && entry.getTimestamp().isBefore(end))
                    .collect(Collectors.toList());
            }
            
            if (userId != null) {
                entries = entries.stream()
                    .filter(entry -> entry.getUserId().equals(userId))
                    .collect(Collectors.toList());
            }
            
            // Sort by timestamp
            entries.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
            
            if ("csv".equalsIgnoreCase(format)) {
                String csvData = generateCsvExport(entries);
                result.put("success", true);
                result.put("data", csvData);
                result.put("format", "csv");
                result.put("count", entries.size());
            } else {
                result.put("success", true);
                result.put("data", entries);
                result.put("format", "json");
                result.put("count", entries.size());
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Generate CSV export
     */
    private String generateCsvExport(List<OfflineAuditEntryDto> entries) {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("ID,User ID,Username,Tenant ID,Action,Resource Type,Resource ID,Resource Name,");
        csv.append("Timestamp,Offline,Success,Error Message,Device ID,Session ID,IP Address,User Agent\n");
        
        // Data rows
        for (OfflineAuditEntryDto entry : entries) {
            csv.append(escapeCsv(entry.getId())).append(",");
            csv.append(entry.getUserId()).append(",");
            csv.append(escapeCsv(entry.getUsername())).append(",");
            csv.append(escapeCsv(entry.getTenantId())).append(",");
            csv.append(escapeCsv(entry.getAction())).append(",");
            csv.append(escapeCsv(entry.getResourceType())).append(",");
            csv.append(entry.getResourceId() != null ? entry.getResourceId() : "").append(",");
            csv.append(escapeCsv(entry.getResourceName())).append(",");
            csv.append(entry.getTimestamp()).append(",");
            csv.append(entry.getOffline()).append(",");
            csv.append(entry.getSuccess()).append(",");
            csv.append(escapeCsv(entry.getErrorMessage())).append(",");
            csv.append(escapeCsv(entry.getDeviceId())).append(",");
            csv.append(escapeCsv(entry.getSessionId())).append(",");
            csv.append(escapeCsv(entry.getIpAddress())).append(",");
            csv.append(escapeCsv(entry.getUserAgent())).append("\n");
        }
        
        return csv.toString();
    }
    
    /**
     * Escape CSV values
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        
        return value;
    }
}
