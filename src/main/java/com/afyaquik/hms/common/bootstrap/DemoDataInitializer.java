package com.afyaquik.hms.common.bootstrap;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final PasswordEncoder passwordEncoder;
    private final StaffRoleRepository staffRoleRepository;
    private final StaffUserRepository staffUserRepository;
    private final StaffShiftRepository staffShiftRepository;

    public DemoDataInitializer(
            PasswordEncoder passwordEncoder,
            StaffRoleRepository staffRoleRepository,
            StaffUserRepository staffUserRepository,
            StaffShiftRepository staffShiftRepository) {
        this.passwordEncoder = passwordEncoder;
        this.staffRoleRepository = staffRoleRepository;
        this.staffUserRepository = staffUserRepository;
        this.staffShiftRepository = staffShiftRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedTenant("clinic-a");
        seedTenant("clinic-b");
    }

    private void seedTenant(String tenantId) {
        StaffRole doctorRole = ensureRole(tenantId, "doctor", "Doctor");
        StaffRole nurseRole = ensureRole(tenantId, "nurse", "Nurse");
        StaffRole receptionistRole = ensureRole(tenantId, "reception", "Front Desk");

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

        if (staffShiftRepository.existsByTenantId(tenantId)) {
            return;
        }

        log.info("Seeding sample shifts for tenant {}", tenantId);
        OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC)
                .plusDays(1)
                .withHour(8)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        createShift(
                tenantId,
                doctor,
                doctorRole.getRoleKey(),
                "cardiology",
                ShiftType.MORNING,
                ShiftStatus.SCHEDULED,
                base,
                base.plusHours(8),
                "Morning rounds and consultations");

        createShift(
                tenantId,
                doctor,
                doctorRole.getRoleKey(),
                "cardiology",
                ShiftType.AFTERNOON,
                ShiftStatus.SCHEDULED,
                base.plusDays(1),
                base.plusDays(1).plusHours(8),
                "Follow-up clinic for chronic patients");

        OffsetDateTime nightStart = base.withHour(20);
        createShift(
                tenantId,
                nurse,
                nurseRole.getRoleKey(),
                "emergency",
                ShiftType.NIGHT,
                ShiftStatus.SCHEDULED,
                nightStart,
                nightStart.plusHours(12),
                "Overnight triage coverage");

        OffsetDateTime weekendStart = base.plusDays(2);
        createShift(
                tenantId,
                nurse,
                nurseRole.getRoleKey(),
                "surgery",
                ShiftType.MORNING,
                ShiftStatus.SCHEDULED,
                weekendStart,
                weekendStart.plusHours(8),
                "Pre-op prep and recovery checks");

        OffsetDateTime frontDeskStart = base.plusHours(4);
        createShift(
                tenantId,
                receptionist,
                receptionistRole.getRoleKey(),
                "front_office",
                ShiftType.AFTERNOON,
                ShiftStatus.SCHEDULED,
                frontDeskStart,
                frontDeskStart.plusHours(6),
                "Front desk coverage and appointment coordination");
    }

    private StaffRole ensureRole(String tenantId, String key, String displayName) {
        return staffRoleRepository
                .findByTenantIdAndRoleKey(tenantId, key)
                .orElseGet(() -> {
                    StaffRole role = new StaffRole();
                    role.setTenantId(tenantId);
                    role.setRoleKey(key);
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
            String roleKey,
            String departmentId,
            ShiftType shiftType,
            ShiftStatus status,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt,
            String notes) {
        StaffShift shift = new StaffShift();
        shift.setTenantId(tenantId);
        shift.setStaffUser(staffUser);
        shift.setRoleKey(roleKey);
        shift.setDepartmentId(departmentId);
        shift.setShiftType(shiftType);
        shift.setStatus(status);
        shift.setStartsAt(startsAt);
        shift.setEndsAt(endsAt);
        shift.setNotes(notes);
        staffShiftRepository.save(shift);
    }
}
