package com.afyaquik.hms.superadmin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.util.*;

/**
 * Service for database records viewing and export operations.
 * Provides functionality to view and export database tables.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseRecordsService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Get all available database tables
     */
    public List<String> getAllTables() {
        String sql = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """;
        
        return jdbcTemplate.queryForList(sql, String.class);
    }

    /**
     * Get table schema information
     */
    public List<Map<String, Object>> getTableSchema(String tableName) {
        String sql = """
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = ? 
            AND table_schema = 'public'
            ORDER BY ordinal_position
            """;
        
        return jdbcTemplate.queryForList(sql, tableName);
    }

    /**
     * Get table data with pagination and filtering
     */
    public Map<String, Object> getTableData(String tableName, int page, int size, String search, String sortBy, String sortDirection) {
        // Validate table name to prevent SQL injection
        if (!isValidTableName(tableName)) {
            throw new IllegalArgumentException("Invalid table name: " + tableName);
        }

        // Build WHERE clause for search
        String whereClause = "";
        List<Object> params = new ArrayList<>();
        
        if (search != null && !search.trim().isEmpty()) {
            // Get all columns for the table
            List<Map<String, Object>> columns = getTableSchema(tableName);
            List<String> searchConditions = new ArrayList<>();
            
            for (Map<String, Object> column : columns) {
                String columnName = (String) column.get("column_name");
                String dataType = (String) column.get("data_type");
                
                // Only search in text/varchar columns
                if (dataType.contains("text") || dataType.contains("varchar") || dataType.contains("char")) {
                    searchConditions.add("CAST(" + columnName + " AS TEXT) ILIKE ?");
                    params.add("%" + search + "%");
                }
            }
            
            if (!searchConditions.isEmpty()) {
                whereClause = " WHERE " + String.join(" OR ", searchConditions);
            }
        }

        // Build ORDER BY clause
        String orderBy = "";
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            if (isValidColumnName(tableName, sortBy)) {
                orderBy = " ORDER BY " + sortBy + " " + sortDirection.toUpperCase();
            }
        }

        // Get total count
        String countSql = "SELECT COUNT(*) FROM " + tableName + whereClause;
        int totalCount = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        // Get paginated data
        int offset = page * size;
        String dataSql = "SELECT * FROM " + tableName + whereClause + orderBy + " LIMIT ? OFFSET ?";
        params.add(size);
        params.add(offset);
        
        List<Map<String, Object>> data = jdbcTemplate.queryForList(dataSql, params.toArray());
        
        // Calculate pagination info
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", data);
        result.put("totalElements", totalCount);
        result.put("totalPages", totalPages);
        result.put("size", size);
        result.put("number", page);
        result.put("first", page == 0);
        result.put("last", page >= totalPages - 1);
        result.put("numberOfElements", data.size());
        
        return result;
    }

    /**
     * Export table data to CSV
     */
    public byte[] exportTableToCsv(String tableName, String search, String sortBy, String sortDirection) {
        if (!isValidTableName(tableName)) {
            throw new IllegalArgumentException("Invalid table name: " + tableName);
        }

        try {
            // Get all data (no pagination for export)
            Map<String, Object> data = getTableData(tableName, 0, Integer.MAX_VALUE, search, sortBy, sortDirection);
            List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("content");
            
            if (records.isEmpty()) {
                return "No data found".getBytes();
            }

            StringWriter writer = new StringWriter();
            
            // Write CSV header
            Map<String, Object> firstRecord = records.get(0);
            List<String> headers = new ArrayList<>(firstRecord.keySet());
            writer.write(String.join(",", headers));
            writer.write("\n");
            
            // Write data rows
            for (Map<String, Object> record : records) {
                List<String> values = new ArrayList<>();
                for (String header : headers) {
                    Object value = record.get(header);
                    String stringValue = value != null ? value.toString() : "";
                    // Escape commas and quotes
                    if (stringValue.contains(",") || stringValue.contains("\"")) {
                        stringValue = "\"" + stringValue.replace("\"", "\"\"") + "\"";
                    }
                    values.add(stringValue);
                }
                writer.write(String.join(",", values));
                writer.write("\n");
            }
            
            return writer.toString().getBytes("UTF-8");
        } catch (Exception e) {
            log.error("Error exporting table to CSV: {}", tableName, e);
            throw new RuntimeException("Failed to export table to CSV", e);
        }
    }

    /**
     * Export table data to Excel
     */
    public byte[] exportTableToExcel(String tableName, String search, String sortBy, String sortDirection) {
        if (!isValidTableName(tableName)) {
            throw new IllegalArgumentException("Invalid table name: " + tableName);
        }

        try {
            // Get all data (no pagination for export)
            Map<String, Object> data = getTableData(tableName, 0, Integer.MAX_VALUE, search, sortBy, sortDirection);
            List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("content");
            
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet(tableName);
            
            if (records.isEmpty()) {
                Row row = sheet.createRow(0);
                Cell cell = row.createCell(0);
                cell.setCellValue("No data found");
            } else {
                // Create header row
                Map<String, Object> firstRecord = records.get(0);
                List<String> headers = new ArrayList<>(firstRecord.keySet());
                
                Row headerRow = sheet.createRow(0);
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers.get(i));
                    cell.setCellStyle(headerStyle);
                }
                
                // Create data rows
                for (int i = 0; i < records.size(); i++) {
                    Row row = sheet.createRow(i + 1);
                    Map<String, Object> record = records.get(i);
                    
                    for (int j = 0; j < headers.size(); j++) {
                        Cell cell = row.createCell(j);
                        Object value = record.get(headers.get(j));
                        if (value != null) {
                            cell.setCellValue(value.toString());
                        }
                    }
                }
                
                // Auto-size columns
                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            return outputStream.toByteArray();
        } catch (IOException e) {
            log.error("Error exporting table to Excel: {}", tableName, e);
            throw new RuntimeException("Failed to export table to Excel", e);
        }
    }

    /**
     * Get database statistics
     */
    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get table count
        String tableCountSql = """
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            """;
        int tableCount = jdbcTemplate.queryForObject(tableCountSql, Integer.class);
        stats.put("tableCount", tableCount);
        
        // Get total row count across all tables
        List<String> tables = getAllTables();
        long totalRows = 0;
        Map<String, Long> tableRowCounts = new HashMap<>();
        
        for (String table : tables) {
            try {
                String countSql = "SELECT COUNT(*) FROM " + table;
                Long rowCount = jdbcTemplate.queryForObject(countSql, Long.class);
                tableRowCounts.put(table, rowCount);
                totalRows += rowCount;
            } catch (Exception e) {
                log.warn("Could not count rows for table: {}", table, e);
                tableRowCounts.put(table, 0L);
            }
        }
        
        stats.put("totalRows", totalRows);
        stats.put("tableRowCounts", tableRowCounts);
        
        return stats;
    }

    /**
     * Validate table name to prevent SQL injection
     */
    private boolean isValidTableName(String tableName) {
        return tableName != null && 
               tableName.matches("^[a-zA-Z_][a-zA-Z0-9_]*$") && 
               !tableName.contains(";") && 
               !tableName.contains("--") &&
               !tableName.contains("/*");
    }

    /**
     * Validate column name to prevent SQL injection
     */
    private boolean isValidColumnName(String tableName, String columnName) {
        if (!isValidTableName(tableName) || columnName == null) {
            return false;
        }
        
        // Check if column exists in the table
        String sql = """
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = ? 
            AND column_name = ?
            AND table_schema = 'public'
            """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
        return count != null && count > 0;
    }
}
