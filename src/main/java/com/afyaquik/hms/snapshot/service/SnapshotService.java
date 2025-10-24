package com.afyaquik.hms.snapshot.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.appointment.domain.Appointment;
import com.afyaquik.hms.appointment.repository.AppointmentRepository;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.DepartmentRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.pharmacy.repository.MedicationRepository;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import com.afyaquik.hms.snapshot.domain.DeviceSnapshot;
import com.afyaquik.hms.snapshot.domain.SnapshotData;
import com.afyaquik.hms.snapshot.domain.SnapshotType;
import com.afyaquik.hms.snapshot.repository.DeviceSnapshotRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class SnapshotService {
    
    private static final Logger log = LoggerFactory.getLogger(SnapshotService.class);
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private StaffUserRepository staffUserRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private StaffShiftRepository staffShiftRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private MedicationRepository medicationRepository;
    
    @Autowired
    private VisitQueueItemRepository visitQueueItemRepository;
    
    @Autowired
    private DeviceSnapshotRepository deviceSnapshotRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Create a full snapshot for a device
     */
    public DeviceSnapshot createFullSnapshot(String deviceId, String tenantId) {
        log.info("Creating full snapshot for device: {} tenant: {}", deviceId, tenantId);
        
        try {
            log.info("Step 1: Extracting essential data for tenant: {}", tenantId);
            SnapshotData snapshotData = extractEssentialData(tenantId);
            log.info("Step 1 completed: Extracted data successfully");
            
            log.info("Step 2: Serializing snapshot data to JSON");
            String snapshotJson = objectMapper.writeValueAsString(snapshotData);
            log.info("Step 2 completed: JSON serialization successful, size: {} bytes", snapshotJson.length());
            
            log.info("Step 3: Creating DeviceSnapshot entity");
            DeviceSnapshot snapshot = new DeviceSnapshot();
            snapshot.setDeviceId(deviceId);
            snapshot.setTenantId(tenantId);
            snapshot.setSnapshotType(SnapshotType.FULL);
            snapshot.setSnapshotData(snapshotJson);
            snapshot.setVersion(1L);
            snapshot.setCreatedAt(Instant.now());
            snapshot.setDataSize(snapshotJson.length());
            log.info("Step 3 completed: DeviceSnapshot entity created");
            
            log.info("Step 4: Saving snapshot to database");
            DeviceSnapshot savedSnapshot = deviceSnapshotRepository.save(snapshot);
            log.info("Full snapshot created successfully for device: {} size: {} bytes", 
                    deviceId, snapshotJson.length());
            
            return savedSnapshot;
            
        } catch (Exception e) {
            log.error("Failed to create full snapshot for device: {} tenant: {}", deviceId, tenantId, e);
            log.error("Exception details: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create snapshot: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create an incremental snapshot for a device
     */
    public DeviceSnapshot createIncrementalSnapshot(String deviceId, String tenantId, 
                                                   LocalDateTime since) {
        log.info("Creating incremental snapshot for device: {} tenant: {} since: {}", 
                deviceId, tenantId, since);
        
        try {
            SnapshotData snapshotData = extractIncrementalData(tenantId, since);
            String snapshotJson = objectMapper.writeValueAsString(snapshotData);
            
            DeviceSnapshot snapshot = new DeviceSnapshot();
            snapshot.setDeviceId(deviceId);
            snapshot.setTenantId(tenantId);
            snapshot.setSnapshotType(SnapshotType.INCREMENTAL);
            snapshot.setSnapshotData(snapshotJson);
            snapshot.setVersion(getNextVersion(deviceId, tenantId));
            snapshot.setCreatedAt(Instant.now());
            snapshot.setDataSize(snapshotJson.length());
            
            DeviceSnapshot savedSnapshot = deviceSnapshotRepository.save(snapshot);
            log.info("Incremental snapshot created successfully for device: {} size: {} bytes", 
                    deviceId, snapshotJson.length());
            
            return savedSnapshot;
            
        } catch (Exception e) {
            log.error("Failed to create incremental snapshot for device: {} tenant: {}", deviceId, tenantId, e);
            throw new RuntimeException("Failed to create incremental snapshot", e);
        }
    }
    
    /**
     * Extract essential data for snapshot
     */
    private SnapshotData extractEssentialData(String tenantId) {
        log.info("Extracting essential data for tenant: {}", tenantId);
        
        SnapshotData data = new SnapshotData();
        
        try {
            // Patients (essential for healthcare operations)
            log.info("Extracting patients for tenant: {}", tenantId);
            List<Patient> patients = patientRepository.findByTenantIdAndDeletedFalseAndSearchTerm(
                tenantId, "%", "%", "%", "%");
            data.setPatients(patients);
            log.info("Extracted {} patients", patients.size());
            
            // Staff users (for authentication and permissions) - Create DTOs to avoid circular references
            log.info("Extracting staff for tenant: {}", tenantId);
            List<StaffUser> staffEntities = staffUserRepository.findByTenantId(tenantId);
            List<Map<String, Object>> staffDtos = staffEntities.stream()
                .map(this::convertStaffUserToDto)
                .collect(java.util.stream.Collectors.toList());
            data.setStaff(staffDtos);
            log.info("Extracted {} staff members", staffDtos.size());
            
            // Departments (for appointments and services)
            log.info("Extracting departments for tenant: {}", tenantId);
            List<Department> departments = departmentRepository.findByTenantIdOrderByDisplayNameAsc(tenantId);
            data.setDepartments(departments);
            log.info("Extracted {} departments", departments.size());
            
            // Upcoming appointments (next 30 days) - Convert to DTOs to avoid circular references
            log.info("Extracting appointments for tenant: {}", tenantId);
            LocalDateTime startDate = LocalDateTime.now();
            LocalDateTime endDate = startDate.plusDays(30);
            List<Appointment> appointmentEntities = appointmentRepository
                    .findByTenantIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(tenantId, startDate, endDate);
            List<Map<String, Object>> appointmentDtos = appointmentEntities.stream()
                .map(this::convertAppointmentToDto)
                .collect(java.util.stream.Collectors.toList());
            data.setAppointments(appointmentDtos);
            log.info("Extracted {} upcoming appointments", appointmentDtos.size());
            
            // Available medications (active only)
            log.info("Extracting medications for tenant: {}", tenantId);
            List<Medication> medications = medicationRepository.findActiveByTenantId(tenantId);
            data.setMedications(medications);
            log.info("Extracted {} active medications", medications.size());
            
            // Recent queue items (last 7 days)
            log.info("Extracting queue items for tenant: {}", tenantId);
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<VisitQueueItem> queueItems = visitQueueItemRepository
                    .findRecentQueueItemsForSnapshot(tenantId, sevenDaysAgo.toInstant(ZoneOffset.UTC));
            data.setQueueItems(queueItems);
            log.info("Extracted {} recent queue items", queueItems.size());
            
            log.info("Successfully extracted essential data for tenant: {} - Patients: {}, Staff: {}, Departments: {}, Appointments: {}, Medications: {}, Queue Items: {}", 
                    tenantId, patients.size(), staffDtos.size(), departments.size(), appointmentEntities.size(), medications.size(), queueItems.size());
            
        } catch (Exception e) {
            log.error("Error extracting essential data for tenant: {}", tenantId, e);
            // Set empty data on error to prevent complete failure
            data.setPatients(Arrays.asList());
            data.setStaff(Arrays.asList());
            data.setDepartments(Arrays.asList());
            data.setAppointments(Arrays.asList());
            data.setMedications(Arrays.asList());
            data.setQueueItems(Arrays.asList());
            log.warn("Set empty data due to extraction error for tenant: {}", tenantId);
        }
        
        // System settings and reference data
        Map<String, Object> systemData = new HashMap<>();
        systemData.put("snapshotTimestamp", LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
        systemData.put("tenantId", tenantId);
        systemData.put("dataVersion", "1.0");
        data.setSystemData(systemData);
        
        log.info("Extracted snapshot data for tenant: {} - Total records: {}", tenantId, data.getTotalRecords());
        
        return data;
    }
    
    /**
     * Convert StaffUser entity to DTO to avoid circular references
     */
    private Map<String, Object> convertStaffUserToDto(StaffUser staffUser) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", staffUser.getId());
        dto.put("username", staffUser.getUsername());
        dto.put("displayName", staffUser.getDisplayName());
        dto.put("email", staffUser.getEmail());
        dto.put("enabled", staffUser.isEnabled());
        dto.put("tenantId", staffUser.getTenantId());
        dto.put("createdAt", staffUser.getCreatedAt());
        dto.put("updatedAt", staffUser.getUpdatedAt());
        
        // Convert roles without circular references
        if (staffUser.getRoles() != null) {
            List<Map<String, Object>> roleDtos = staffUser.getRoles().stream()
                .map(role -> {
                    Map<String, Object> roleDto = new HashMap<>();
                    roleDto.put("id", role.getId());
                    roleDto.put("roleKey", role.getRoleKey());
                    roleDto.put("displayName", role.getDisplayName());
                    return roleDto;
                })
                .collect(java.util.stream.Collectors.toList());
            dto.put("roles", roleDtos);
        }
        
        // Convert supervisor info without circular references
        if (staffUser.getSupervisorId() != null) {
            Map<String, Object> supervisorDto = new HashMap<>();
            supervisorDto.put("id", staffUser.getSupervisorId());
            supervisorDto.put("displayName", staffUser.getSupervisorDisplayName());
            dto.put("supervisor", supervisorDto);
        }
        
        // Skip groups to avoid circular references - this is the key fix
        // Groups will be handled separately if needed for offline functionality
        
        return dto;
    }
    
    /**
     * Convert Appointment entity to DTO to avoid circular references
     */
    private Map<String, Object> convertAppointmentToDto(Appointment appointment) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", appointment.getId());
        dto.put("appointmentDateTime", appointment.getAppointmentDateTime());
            dto.put("duration", appointment.getDurationMinutes());
        dto.put("status", appointment.getStatus());
        dto.put("notes", appointment.getNotes());
        dto.put("createdAt", appointment.getCreatedAt());
        dto.put("updatedAt", appointment.getUpdatedAt());
        
        // Convert patient info without circular references
        if (appointment.getPatient() != null) {
            Map<String, Object> patientDto = new HashMap<>();
            patientDto.put("id", appointment.getPatient().getId());
            patientDto.put("firstName", appointment.getPatient().getFirstName());
            patientDto.put("lastName", appointment.getPatient().getLastName());
            patientDto.put("medicalRecordNumber", appointment.getPatient().getMedicalRecordNumber());
            dto.put("patient", patientDto);
        }
        
        // Convert provider info without circular references
        if (appointment.getProvider() != null) {
            Map<String, Object> providerDto = new HashMap<>();
            providerDto.put("id", appointment.getProvider().getId());
            providerDto.put("username", appointment.getProvider().getUsername());
            providerDto.put("displayName", appointment.getProvider().getDisplayName());
            dto.put("provider", providerDto);
        }
        
        // Convert department info
        if (appointment.getDepartment() != null) {
            Map<String, Object> departmentDto = new HashMap<>();
            departmentDto.put("id", appointment.getDepartment().getId());
            departmentDto.put("displayName", appointment.getDepartment().getDisplayName());
            dto.put("department", departmentDto);
        }
        
        return dto;
    }
    
    /**
     * Extract incremental data since a specific timestamp
     */
    private SnapshotData extractIncrementalData(String tenantId, LocalDateTime since) {
        log.info("Extracting incremental data for tenant: {} since: {}", tenantId, since);
        
        SnapshotData data = new SnapshotData();
        
        try {
            // For incremental updates, we'll get all data since the timestamp
            // Note: This is a simplified approach. In a production system, you'd want
            // more sophisticated change tracking (e.g., using database triggers or audit tables)
            
            // Get all patients (since we don't have updatedAt filtering in PatientRepository)
            List<Patient> patients = patientRepository.findByTenantIdAndDeletedFalseAndSearchTerm(
                tenantId, "%", "%", "%", "%");
            data.setPatients(patients);
            log.info("Extracted {} patients for incremental update", patients.size());
            
            // Get all staff (since we don't have updatedAt filtering in StaffUserRepository)
            List<StaffUser> staffEntities = staffUserRepository.findByTenantId(tenantId);
            List<Map<String, Object>> staffDtos = staffEntities.stream()
                .map(this::convertStaffUserToDto)
                .collect(java.util.stream.Collectors.toList());
            data.setStaff(staffDtos);
            log.info("Extracted {} staff members for incremental update", staffDtos.size());
            
            // Get all departments
            List<Department> departments = departmentRepository.findByTenantIdOrderByDisplayNameAsc(tenantId);
            data.setDepartments(departments);
            log.info("Extracted {} departments for incremental update", departments.size());
            
            // Get appointments since the timestamp - Convert to DTOs to avoid circular references
            List<Appointment> appointmentEntities = appointmentRepository
                    .findByTenantIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                        tenantId, since, LocalDateTime.now());
            List<Map<String, Object>> appointmentDtos = appointmentEntities.stream()
                .map(this::convertAppointmentToDto)
                .collect(java.util.stream.Collectors.toList());
            data.setAppointments(appointmentDtos);
            log.info("Extracted {} appointments since {}", appointmentDtos.size(), since);
            
            // Get active medications
            List<Medication> medications = medicationRepository.findActiveByTenantId(tenantId);
            data.setMedications(medications);
            log.info("Extracted {} active medications for incremental update", medications.size());
            
            // Get queue items since the timestamp (last 7 days max)
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            LocalDateTime searchSince = since.isAfter(sevenDaysAgo) ? since : sevenDaysAgo;
            List<VisitQueueItem> queueItems = visitQueueItemRepository
                    .findRecentQueueItemsForSnapshot(tenantId, searchSince.toInstant(ZoneOffset.UTC));
            data.setQueueItems(queueItems);
            log.info("Extracted {} queue items since {}", queueItems.size(), searchSince);
            
        } catch (Exception e) {
            log.error("Error extracting incremental data for tenant: {} since: {}", tenantId, since, e);
            // Set empty data on error
            data.setPatients(Arrays.asList());
            data.setStaff(Arrays.asList());
            data.setDepartments(Arrays.asList());
            data.setAppointments(Arrays.asList());
            data.setMedications(Arrays.asList());
            data.setQueueItems(Arrays.asList());
        }
        
        // System data
        Map<String, Object> systemData = new HashMap<>();
        systemData.put("snapshotTimestamp", LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
        systemData.put("tenantId", tenantId);
        systemData.put("dataVersion", "1.0");
        systemData.put("incremental", true);
        systemData.put("since", since.toEpochSecond(ZoneOffset.UTC));
        data.setSystemData(systemData);
        
        log.info("Extracted incremental snapshot data for tenant: {} since: {} - Total records: {}", 
                tenantId, since, data.getTotalRecords());
        
        return data;
    }
    
    /**
     * Get the next version number for a device
     */
    private Long getNextVersion(String deviceId, String tenantId) {
        DeviceSnapshot lastSnapshot = deviceSnapshotRepository
                .findTopByDeviceIdAndTenantIdOrderByVersionDesc(deviceId, tenantId);
        return lastSnapshot != null ? lastSnapshot.getVersion() + 1 : 1L;
    }
    
    /**
     * Get the latest snapshot for a device
     */
    public DeviceSnapshot getLatestSnapshot(String deviceId, String tenantId) {
        return deviceSnapshotRepository
                .findTopByDeviceIdAndTenantIdOrderByVersionDesc(deviceId, tenantId);
    }
    
    /**
     * Get all snapshots for a device
     */
    public List<DeviceSnapshot> getDeviceSnapshots(String deviceId, String tenantId) {
        return deviceSnapshotRepository.findByDeviceIdAndTenantIdOrderByVersionDesc(deviceId, tenantId);
    }
    
    /**
     * Delete old snapshots (keep only last 10)
     */
    public void cleanupOldSnapshots(String deviceId, String tenantId) {
        List<DeviceSnapshot> snapshots = deviceSnapshotRepository
                .findByDeviceIdAndTenantIdOrderByVersionDesc(deviceId, tenantId);
        
        if (snapshots.size() > 10) {
            List<DeviceSnapshot> toDelete = snapshots.subList(10, snapshots.size());
            deviceSnapshotRepository.deleteAll(toDelete);
            log.info("Cleaned up {} old snapshots for device: {}", toDelete.size(), deviceId);
        }
    }
    
    /**
     * Check if data has changed since last snapshot
     */
    public boolean hasDataChanged(String tenantId, LocalDateTime since) {
        try {
            // Convert LocalDateTime to Instant for repository calls
            Instant sinceInstant = since.atZone(ZoneId.systemDefault()).toInstant();
            Instant nowInstant = Instant.now();
            
            // Check if there are any new patients since the timestamp
            long patientCount = patientRepository.countByTenantIdAndCreatedAtBetweenAndDeletedFalse(
                tenantId, sinceInstant, nowInstant);
            
            // Check if there are any new staff since the timestamp
            long staffCount = staffUserRepository.countByTenantIdAndCreatedAtBetweenAndDeletedFalse(
                tenantId, sinceInstant, nowInstant);
            
            // Check if there are any new appointments since the timestamp
            List<Appointment> appointments = appointmentRepository
                    .findByTenantIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                        tenantId, since, LocalDateTime.now());
            
            // Check if there are any new queue items since the timestamp
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            LocalDateTime searchSince = since.isAfter(sevenDaysAgo) ? since : sevenDaysAgo;
            List<VisitQueueItem> queueItems = visitQueueItemRepository
                    .findRecentQueueItemsForSnapshot(tenantId, searchSince.toInstant(ZoneOffset.UTC));
            
            boolean hasChanges = (patientCount + staffCount + appointments.size() + queueItems.size()) > 0;
            
            log.info("Data change check for tenant: {} since: {} - Patients: {}, Staff: {}, Appointments: {}, QueueItems: {}, HasChanges: {}", 
                    tenantId, since, patientCount, staffCount, appointments.size(), queueItems.size(), hasChanges);
            
            return hasChanges;
            
        } catch (Exception e) {
            log.error("Error checking data changes for tenant: {} since: {}", tenantId, since, e);
            // Return true on error to trigger a sync
            return true;
        }
    }
    
    /**
     * Get snapshot statistics for a tenant
     */
    public Map<String, Object> getSnapshotStatistics(String tenantId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get total counts
            long patientCount = patientRepository.countByTenantIdAndDeletedFalse(tenantId);
            long staffCount = staffUserRepository.countByTenantIdAndDeletedFalse(tenantId);
            long departmentCount = departmentRepository.findByTenantIdOrderByDisplayNameAsc(tenantId).size();
            long medicationCount = medicationRepository.findActiveByTenantId(tenantId).size();
            
            // Get recent activity (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            Instant yesterdayInstant = yesterday.atZone(ZoneId.systemDefault()).toInstant();
            Instant nowInstant = Instant.now();
            long recentPatients = patientRepository.countByTenantIdAndCreatedAtBetweenAndDeletedFalse(
                tenantId, yesterdayInstant, nowInstant);
            long recentStaff = staffUserRepository.countByTenantIdAndCreatedAtBetweenAndDeletedFalse(
                tenantId, yesterdayInstant, nowInstant);
            
            stats.put("totalPatients", patientCount);
            stats.put("totalStaff", staffCount);
            stats.put("totalDepartments", departmentCount);
            stats.put("totalMedications", medicationCount);
            stats.put("recentPatients", recentPatients);
            stats.put("recentStaff", recentStaff);
            stats.put("lastUpdated", LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
            
            log.info("Generated snapshot statistics for tenant: {} - Patients: {}, Staff: {}, Departments: {}, Medications: {}", 
                    tenantId, patientCount, staffCount, departmentCount, medicationCount);
            
        } catch (Exception e) {
            log.error("Error generating snapshot statistics for tenant: {}", tenantId, e);
            stats.put("error", "Failed to generate statistics");
        }
        
        return stats;
    }
    
    /**
     * Validate snapshot data integrity
     */
    public boolean validateSnapshotData(String snapshotData) {
        try {
            SnapshotData data = objectMapper.readValue(snapshotData, SnapshotData.class);
            
            // Basic validation
            if (data.getSystemData() == null) {
                log.warn("Snapshot data missing system data");
                return false;
            }
            
            if (!data.getSystemData().containsKey("tenantId")) {
                log.warn("Snapshot data missing tenant ID");
                return false;
            }
            
            if (!data.getSystemData().containsKey("dataVersion")) {
                log.warn("Snapshot data missing version");
                return false;
            }
            
            log.info("Snapshot data validation passed");
            return true;
            
        } catch (Exception e) {
            log.error("Error validating snapshot data", e);
            return false;
        }
    }
}
