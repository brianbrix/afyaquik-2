
package com.afyaquik.hms.common.bootstrap;

import java.time.LocalTime;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.DepartmentRepository;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.api.QueueAssignmentRequest;
import com.afyaquik.hms.queue.api.QueueCheckInRequest;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import com.afyaquik.hms.queue.service.QueueService;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import com.afyaquik.hms.configuration.service.FormDefinitionService;
import com.afyaquik.hms.configuration.service.RoleRedirectUrlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!test")
public class DemoDataInitializer implements CommandLineRunner {

    private ShiftType ensureShiftType(String tenantId, String name, String description, LocalTime start, LocalTime end) {
        return shiftTypeRepository.findByName(name)
            .orElseGet(() -> {
                ShiftType st = new ShiftType();
                st.setTenantId(tenantId);
                st.setName(name);
                st.setDescription(description);
                st.setStartTime(start);
                st.setEndTime(end);
                return shiftTypeRepository.save(st);
            });
    }

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final PasswordEncoder passwordEncoder;
    private final StaffRoleRepository staffRoleRepository;
    private final com.afyaquik.hms.scheduling.repository.ShiftTypeRepository shiftTypeRepository;
    private final StaffUserRepository staffUserRepository;
    private final StaffShiftRepository staffShiftRepository;
    private final DepartmentRepository departmentRepository;
    private final PatientRepository patientRepository;
    private final VisitQueueItemRepository visitQueueItemRepository;
    private final QueueService queueService;
    private final FormDefinitionService formDefinitionService;
    private final RoleRedirectUrlService roleRedirectUrlService;

    public DemoDataInitializer(
            PasswordEncoder passwordEncoder,
            StaffRoleRepository staffRoleRepository,
            StaffUserRepository staffUserRepository,
            StaffShiftRepository staffShiftRepository,
            DepartmentRepository departmentRepository,
            FormDefinitionService formDefinitionService,
            PatientRepository patientRepository,
            VisitQueueItemRepository visitQueueItemRepository,
            QueueService queueService,
            RoleRedirectUrlService roleRedirectUrlService,
            com.afyaquik.hms.scheduling.repository.ShiftTypeRepository shiftTypeRepository) {
        this.passwordEncoder = passwordEncoder;
        this.staffRoleRepository = staffRoleRepository;
        this.staffUserRepository = staffUserRepository;
        this.staffShiftRepository = staffShiftRepository;
        this.departmentRepository = departmentRepository;
        this.formDefinitionService = formDefinitionService;
        this.patientRepository = patientRepository;
        this.visitQueueItemRepository = visitQueueItemRepository;
        this.queueService = queueService;
        this.roleRedirectUrlService = roleRedirectUrlService;
        this.shiftTypeRepository = shiftTypeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedTenant("clinic-a");
        seedTenant("clinic-b");
    }

    private void seedTenant(String tenantId) {
        StaffRole adminRole = ensureRole(tenantId, "ADMIN", "Administrator");
        StaffRole doctorRole = ensureRole(tenantId, "DOCTOR", "Doctor");
        StaffRole nurseRole = ensureRole(tenantId, "NURSE", "Nurse");
        StaffRole schedulingManagerRole = ensureRole(tenantId, "SCHEDULING_MANAGER", "Scheduling Manager");
    // Seed default role redirect URLs for all common roles
    roleRedirectUrlService.saveOrUpdate(tenantId, "ADMIN", "/admin");
    roleRedirectUrlService.saveOrUpdate(tenantId, "DOCTOR", "/provider");
    roleRedirectUrlService.saveOrUpdate(tenantId, "NURSE", "/nurse");
    roleRedirectUrlService.saveOrUpdate(tenantId, "RECEPTION", "/queue");
    roleRedirectUrlService.saveOrUpdate(tenantId, "LAB", "/lab");
    roleRedirectUrlService.saveOrUpdate(tenantId, "PHARMACY", "/pharmacy");
    StaffRole receptionistRole = ensureRole(tenantId, "RECEPTION", "Front Desk");

        ensureUser(
                    tenantId,
                    "admin",
                    "System Admin",
                    "admin@" + tenantId + ".example",
                    "password",
                    adminRole);

        StaffUser doctor = ensureUser(
                tenantId,
                "dr.smith",
                "Dr. Anna Smith",
                "anna.smith@" + tenantId + ".example",
                "password",
                doctorRole);

    StaffUser nurse = ensureUser(
                tenantId,
                "nurse.mendez",
                "Nurse Carlos Mendez",
                "carlos.mendez@" + tenantId + ".example",
                "password",
                nurseRole);

    StaffUser receptionist = ensureUser(
                tenantId,
                "reception.jones",
                "Receptionist Kelly Jones",
                "kelly.jones@" + tenantId + ".example",
                "password",
                receptionistRole);

        seedDepartments(tenantId);
    seedForms(tenantId);

        seedQueue(tenantId, doctor, nurse, receptionist);

        if (staffShiftRepository.existsByTenantId(tenantId)) {
            return; // already seeded shifts (and likely queue) keep idempotent
        }

        log.info("Seeding sample shifts for tenant {}", tenantId);
        OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC)
                .plusDays(1)
                .withHour(8)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

    ShiftType morning = ensureShiftType(tenantId, "MORNING", "Morning shift", LocalTime.of(8,0), LocalTime.of(16,0));
    ShiftType afternoon = ensureShiftType(tenantId, "AFTERNOON", "Afternoon shift", LocalTime.of(16,0), LocalTime.of(0,0));
    ShiftType night = ensureShiftType(tenantId, "NIGHT", "Night shift", LocalTime.of(0,0), LocalTime.of(8,0));
    Department cardiology = departmentRepository.findByTenantIdAndDepartmentId(tenantId, "cardiology").orElseThrow();
    Department emergency = departmentRepository.findByTenantIdAndDepartmentId(tenantId, "emergency").orElseThrow();
    Department surgery = departmentRepository.findByTenantIdAndDepartmentId(tenantId, "surgery").orElseThrow();
    Department frontOffice = departmentRepository.findByTenantIdAndDepartmentId(tenantId, "front_office").orElseThrow();

    createShift(
        tenantId,
        doctor,
        doctorRole,
        cardiology,
        morning,
        ShiftStatus.SCHEDULED,
        base,
        base.plusHours(8),
        "Morning rounds and consultations");

    createShift(
        tenantId,
        doctor,
        doctorRole,
        cardiology,
        afternoon,
        ShiftStatus.SCHEDULED,
        base.plusDays(1),
        base.plusDays(1).plusHours(8),
        "Follow-up clinic for chronic patients");

    OffsetDateTime nightStart = base.withHour(20);
    createShift(
        tenantId,
        nurse,
        nurseRole,
        emergency,
        night,
        ShiftStatus.SCHEDULED,
        nightStart,
        nightStart.plusHours(12),
        "Overnight triage coverage");

    OffsetDateTime weekendStart = base.plusDays(2);
    createShift(
        tenantId,
        nurse,
        nurseRole,
        surgery,
        morning,
        ShiftStatus.SCHEDULED,
        weekendStart,
        weekendStart.plusHours(8),
        "Pre-op prep and recovery checks");

    OffsetDateTime frontDeskStart = base.plusHours(4);
    createShift(
        tenantId,
        receptionist,
        receptionistRole,
        frontOffice,
        afternoon,
        ShiftStatus.SCHEDULED,
        frontDeskStart,
        frontDeskStart.plusHours(6),
        "Front desk coverage and appointment coordination");
    }

    private void seedQueue(String tenantId, StaffUser doctor, StaffUser nurse, StaffUser receptionist) {
        if (visitQueueItemRepository.countByTenantId(tenantId) > 0) {
            return; // already seeded for this tenant
        }
        log.info("Seeding sample queue items for tenant {}", tenantId);

        // Ensure a few demo patients exist
        Patient p1 = ensurePatient(tenantId, "MRN-" + tenantId + "-001", "Alice", "Ngugi");
        Patient p2 = ensurePatient(tenantId, "MRN-" + tenantId + "-002", "Brian", "Okello");
        Patient p3 = ensurePatient(tenantId, "MRN-" + tenantId + "-003", "Chloe", "Atieno");
        Patient p4 = ensurePatient(tenantId, "MRN-" + tenantId + "-004", "David", "Mwangi");

        // Use service check-in to benefit from timeline + SLA logic
        queueService.checkIn(tenantId, new QueueCheckInRequest(p1.getId(), "Chest discomfort", "HIGH", "cardiology"));
        queueService.checkIn(tenantId, new QueueCheckInRequest(p2.getId(), "Fainting episode", "CRITICAL", "emergency"));
        queueService.checkIn(tenantId, new QueueCheckInRequest(p3.getId(), "Post-op follow up", "LOW", "surgery"));
        queueService.checkIn(tenantId, new QueueCheckInRequest(p4.getId(), "Prescription refill", "MEDIUM", "pharmacy"));

        // Advance & assign first two to show different workflow states
        try {
        queueService.advanceAndAssign(tenantId, visitQueueItemRepository.findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, p1.getId()).get().getId(),
            "IN_REGISTRATION", new QueueAssignmentRequest(receptionist.getUsername(), receptionist.getDisplayName(), "RECEPTION", "front_office", "Initial registration"));
        queueService.advanceAndAssign(tenantId, visitQueueItemRepository.findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, p2.getId()).get().getId(),
            "IN_REGISTRATION", new QueueAssignmentRequest(receptionist.getUsername(), receptionist.getDisplayName(), "RECEPTION", "front_office", "Urgent registration"));
        } catch (Exception e) {
            log.warn("Failed to advance & assign demo queue items for tenant {}: {}", tenantId, e.getMessage());
        }
    }

    private Patient ensurePatient(String tenantId, String mrn, String firstName, String lastName) {
        return patientRepository.findByTenantIdAndMedicalRecordNumber(tenantId, mrn)
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setTenantId(tenantId);
                    p.setMedicalRecordNumber(mrn);
                    p.setFirstName(firstName);
                    p.setLastName(lastName);
                    return patientRepository.save(p);
                });
    }

    private void seedForms(String tenantId) {
        // Only create initial version if none exists.
        seedFormOnce(tenantId, "patient-intake", "{\n  \"title\": \"Patient Intake\", \n  \"fields\": [\n    { \"name\": \"firstName\", \"label\": \"First Name\", \"type\": \"text\", \"required\": true },\n    { \"name\": \"lastName\", \"label\": \"Last Name\", \"type\": \"text\", \"required\": true },\n    { \"name\": \"dob\", \"label\": \"Date of Birth\", \"type\": \"date\", \"required\": true },\n    { \"name\": \"gender\", \"label\": \"Gender\", \"type\": \"radio\", \"options\": [ {\"value\": \"F\", \"label\": \"Female\"}, {\"value\": \"M\", \"label\": \"Male\"}, {\"value\": \"O\", \"label\": \"Other\"} ], \"required\": true },\n    { \"name\": \"symptoms\", \"label\": \"Symptoms\", \"type\": \"textarea\" },\n    { \"name\": \"allergies\", \"label\": \"Allergies\", \"type\": \"multiselect\", \"options\": [ {\"value\": \"pollen\", \"label\": \"Pollen\"}, {\"value\": \"dust\", \"label\": \"Dust\"}, {\"value\": \"peanuts\", \"label\": \"Peanuts\"} ] },\n    { \"name\": \"consentGiven\", \"label\": \"Consent Given\", \"type\": \"checkbox\" }\n  ]\n}" );

        seedFormOnce(tenantId, "vitals-entry", "{\n  \"title\": \"Vitals\", \n  \"fields\": [\n    { \"name\": \"heightCm\", \"label\": \"Height (cm)\", \"type\": \"number\", \"required\": true },\n    { \"name\": \"weightKg\", \"label\": \"Weight (kg)\", \"type\": \"number\", \"required\": true },\n    { \"name\": \"bmi\", \"label\": \"BMI\", \"type\": \"number\" },\n    { \"name\": \"bp\", \"label\": \"Blood Pressure\", \"type\": \"text\" },\n    { \"name\": \"pulse\", \"label\": \"Pulse\", \"type\": \"number\" },\n    { \"name\": \"recordedAt\", \"label\": \"Recorded At\", \"type\": \"datetime\", \"required\": true }\n  ]\n}" );

        seedFormOnce(tenantId, "treatment-plan", "{\n  \"title\": \"Treatment Plan\", \n  \"fields\": [\n    { \"name\": \"diagnosis\", \"label\": \"Diagnosis\", \"type\": \"text\", \"required\": true },\n    { \"name\": \"planNotes\", \"label\": \"Plan Notes\", \"type\": \"richtext\" },\n    { \"name\": \"followUpDate\", \"label\": \"Follow-up Date\", \"type\": \"date\" }\n  ]\n}" );

        seedFormOnce(tenantId, "discharge-summary", "{\n  \"title\": \"Discharge Summary\", \n  \"fields\": [\n    { \"name\": \"admitDate\", \"label\": \"Admit Date\", \"type\": \"date\" },\n    { \"name\": \"dischargeDate\", \"label\": \"Discharge Date\", \"type\": \"date\" },\n    { \"name\": \"diagnosis\", \"label\": \"Diagnosis\", \"type\": \"text\" },\n    { \"name\": \"summary\", \"label\": \"Summary\", \"type\": \"richtext\" }\n  ]\n}" );
    }

    private void seedFormOnce(String tenantId, String key, String json) {
        if (formDefinitionService.getLatest(tenantId, key).isEmpty()) {
            formDefinitionService.saveNewVersion(tenantId, key, json);
        }
    }

    private void seedDepartments(String tenantId) {
        if (departmentRepository.existsByTenantId(tenantId)) {
            return;
        }
        log.info("Seeding departments for tenant {}", tenantId);
        createDepartment(tenantId, "cardiology", "Cardiology", "Heart and vascular services");
        createDepartment(tenantId, "emergency", "Emergency", "Emergency / Triage");
        createDepartment(tenantId, "surgery", "Surgery", "Surgical ward");
        createDepartment(tenantId, "front_office", "Front Office", "Reception / Registration");
        createDepartment(tenantId, "pharmacy", "Pharmacy", "Medication dispensing");
        createDepartment(tenantId, "billing", "Billing", "Billing and accounts");
    }

    private void createDepartment(String tenantId, String deptId, String name, String description) {
        Department dept = new Department();
        dept.setTenantId(tenantId);
        dept.setDepartmentId(deptId);
        dept.setDisplayName(name);
        dept.setDescription(description);
        departmentRepository.save(dept);
    }
    
    private StaffRole ensureRole(String tenantId, String key, String displayName) {
        String upperKey = key == null ? null : key.toUpperCase();
        return staffRoleRepository
                .findByTenantIdAndRoleKey(tenantId, upperKey)
                .orElseGet(() -> {
                    StaffRole role = new StaffRole();
                    role.setTenantId(tenantId);
                    role.setRoleKey(upperKey);
                    role.setDisplayName(displayName);
                    return staffRoleRepository.save(role);
                });
    }

    private StaffUser ensureUser(
            String tenantId,
            String username,
            String displayName,
            String email,
            String rawPassword,
            StaffRole... roles) {
        StaffUser user = staffUserRepository
                .findByTenantIdAndUsername(tenantId, username)
                .orElseGet(() -> {
                    StaffUser newUser = new StaffUser();
                    newUser.setTenantId(tenantId);
                    newUser.setUsername(username);
                    newUser.setDisplayName(displayName);
                    newUser.setEmail(email);
                    newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
                    newUser.setRoles(new HashSet<>());
                    return newUser;
                });

        boolean changed = false;
        if (!Objects.equals(user.getDisplayName(), displayName)) {
            user.setDisplayName(displayName);
            changed = true;
        }
        if (!Objects.equals(user.getEmail(), email)) {
            user.setEmail(email);
            changed = true;
        }

        Set<StaffRole> requiredRoles = new HashSet<>(Arrays.asList(roles));
        if (!user.getRoles().containsAll(requiredRoles)) {
            user.getRoles().addAll(requiredRoles);
            changed = true;
        }

        if (user.getId() == null || changed) {
            user = staffUserRepository.save(user);
        }

        return user;
    }

    private void createShift(
            String tenantId,
            StaffUser staffUser,
            StaffRole role,
            Department department,
            ShiftType shiftType,
            ShiftStatus status,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt,
            String notes) {
        StaffShift shift = new StaffShift();
        shift.setTenantId(tenantId);
        shift.setStaffUser(staffUser);
        shift.setRole(role);
        shift.setDepartment(department);
        shift.setShiftType(shiftType);
        shift.setStatus(status);
        shift.setStartsAt(startsAt);
        shift.setEndsAt(endsAt);
        shift.setNotes(notes);
        staffShiftRepository.save(shift);
    }
}
