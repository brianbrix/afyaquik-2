package com.afyaquik.hms.superadmin.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.superadmin.service.DatabaseRecordsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for database records viewing and export operations.
 * Only accessible by SUPER_ADMIN users.
 */
@RestController
@RequestMapping("/api/v1/super-admin/database")
@RequiredArgsConstructor
@Slf4j
public class DatabaseRecordsController {

    private final DatabaseRecordsService databaseRecordsService;

    /**
     * Get all available database tables
     */
    @GetMapping("/tables")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getAllTables() {
        try {
            List<String> tables = databaseRecordsService.getAllTables();
            return ResponseEntity.ok(ApiResponse.success(tables));
        } catch (Exception e) {
            log.error("Error fetching database tables", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch database tables: " + e.getMessage()));
        }
    }

    /**
     * Get table schema information
     */
    @GetMapping("/tables/{tableName}/schema")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTableSchema(@PathVariable String tableName) {
        try {
            List<Map<String, Object>> schema = databaseRecordsService.getTableSchema(tableName);
            return ResponseEntity.ok(ApiResponse.success(schema));
        } catch (Exception e) {
            log.error("Error fetching table schema for: {}", tableName, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch table schema: " + e.getMessage()));
        }
    }

    /**
     * Get table data with pagination
     */
    @GetMapping("/tables/{tableName}/data")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            Map<String, Object> data = databaseRecordsService.getTableData(tableName, page, size, search, sortBy, sortDirection);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            log.error("Error fetching table data for: {}", tableName, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch table data: " + e.getMessage()));
        }
    }

    /**
     * Export table data to CSV
     */
    @GetMapping("/tables/{tableName}/export/csv")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportTableToCsv(
            @PathVariable String tableName,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            byte[] csvData = databaseRecordsService.exportTableToCsv(tableName, search, sortBy, sortDirection);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", tableName + "_export.csv");
            headers.setContentLength(csvData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvData);
        } catch (Exception e) {
            log.error("Error exporting table to CSV: {}", tableName, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Export table data to Excel
     */
    @GetMapping("/tables/{tableName}/export/excel")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportTableToExcel(
            @PathVariable String tableName,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            byte[] excelData = databaseRecordsService.exportTableToExcel(tableName, search, sortBy, sortDirection);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", tableName + "_export.xlsx");
            headers.setContentLength(excelData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            log.error("Error exporting table to Excel: {}", tableName, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get database statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDatabaseStats() {
        try {
            Map<String, Object> stats = databaseRecordsService.getDatabaseStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error fetching database statistics", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch database statistics: " + e.getMessage()));
        }
    }
}
