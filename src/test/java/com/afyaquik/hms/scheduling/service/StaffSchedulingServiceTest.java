package com.afyaquik.hms.scheduling.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.scheduling.api.CreateStaffShiftRequest;
import com.afyaquik.hms.scheduling.api.UpdateStaffShiftRequest;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.Department;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StaffSchedulingServiceTest {

    private static final String TENANT_ID = "tenant-123";

    @Mock
    private StaffShiftRepository shiftRepository;

    @Mock
    private StaffUserRepository staffUserRepository;

    @InjectMocks
    private StaffSchedulingService service;

    private StaffUser staffUser;
    private StaffShift existingShift;
    private StaffRole staffRole;
    private Department department;
    private ShiftType shiftType;

    @BeforeEach
    void setUp() {
    staffUser = new StaffUser();
    staffUser.setTenantId(TENANT_ID);
    staffUser.setDisplayName("Dr. Alice");
    ReflectionTestUtils.setField(staffUser, "id", 17L);

    staffRole = new StaffRole();
    staffRole.setRoleKey("PROVIDER");
    staffRole.setDisplayName("Provider");
    ReflectionTestUtils.setField(staffRole, "id", 100L);

    department = new Department();
    department.setDepartmentId("CLINIC-A");
    department.setDisplayName("Clinic A");
    ReflectionTestUtils.setField(department, "id", 200L);

    shiftType = new ShiftType();
    shiftType.setName("DAY");
    shiftType.setDescription("Day shift");
    ReflectionTestUtils.setField(shiftType, "id", 300L);

    existingShift = new StaffShift();
    existingShift.setTenantId(TENANT_ID);
    existingShift.setStaffUser(staffUser);
    existingShift.setRole(staffRole);
    existingShift.setDepartment(department);
    existingShift.setShiftType(shiftType);
    existingShift.setStatus(ShiftStatus.SCHEDULED);
    existingShift.setStartsAt(OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC));
    existingShift.setEndsAt(OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC));
    ReflectionTestUtils.setField(existingShift, "id", 42L);
    }

    @Test
    void createShift_persistsEntityAndReturnsDto() {

    CreateStaffShiftRequest request = new CreateStaffShiftRequest(
        staffUser.getId(),
        staffRole.getId(),
        department.getId(),
        shiftType.getId(),
        OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC),
        OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC),
        "Covering triage window");

        when(staffUserRepository.findById(staffUser.getId())).thenReturn(Optional.of(staffUser));
        when(shiftRepository.existsOverlappingShift(any(), anyLong(), any(), any(), any())).thenReturn(false);
        when(shiftRepository.save(any(StaffShift.class))).thenAnswer(invocation -> {
            StaffShift saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 99L);
            return saved;
        });

        StaffShiftDto dto = service.createShift(TENANT_ID, request);

        assertThat(dto.id()).isEqualTo(99L);
        assertThat(dto.staffUserId()).isEqualTo(staffUser.getId());
    // assertThat(dto.shiftTypeId()).isEqualTo(shiftType.getId());
        assertThat(dto.status()).isEqualTo(ShiftStatus.SCHEDULED);

        ArgumentCaptor<StaffShift> shiftCaptor = ArgumentCaptor.forClass(StaffShift.class);
        verify(shiftRepository).save(shiftCaptor.capture());
        StaffShift persisted = shiftCaptor.getValue();
        assertThat(persisted.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(persisted.getNotes()).isEqualTo("Covering triage window");
    }

    @Test
    void createShift_rejectsOverlappingAssignments() {
    CreateStaffShiftRequest request = new CreateStaffShiftRequest(
        staffUser.getId(),
        staffRole.getId(),
        department.getId(),
        shiftType.getId(),
        existingShift.getStartsAt(),
        existingShift.getEndsAt(),
        null);

        when(staffUserRepository.findById(staffUser.getId())).thenReturn(Optional.of(staffUser));
        when(shiftRepository.existsOverlappingShift(TENANT_ID, staffUser.getId(), existingShift.getStartsAt(), existingShift.getEndsAt(), null))
                .thenReturn(true);

        assertThatThrownBy(() -> service.createShift(TENANT_ID, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("overlaps");
    }

    @Test
    void approveSwap_reassignsStaffAndUpdatesStatus() {
        StaffUser replacement = new StaffUser();
        replacement.setTenantId(TENANT_ID);
        replacement.setDisplayName("Dr. Bob");
        ReflectionTestUtils.setField(replacement, "id", 21L);

        existingShift.setStatus(ShiftStatus.SWAP_REQUESTED);
        when(shiftRepository.findById(existingShift.getId())).thenReturn(Optional.of(existingShift));
        when(staffUserRepository.findById(replacement.getId())).thenReturn(Optional.of(replacement));
        when(shiftRepository.existsOverlappingShift(TENANT_ID, replacement.getId(), existingShift.getStartsAt(), existingShift.getEndsAt(), existingShift.getId()))
                .thenReturn(false);
        when(shiftRepository.save(existingShift)).thenReturn(existingShift);

        StaffShiftDto dto = service.approveSwap(TENANT_ID, existingShift.getId(), replacement.getId(), "Swapping for leave", "Keys in locker");

        assertThat(dto.status()).isEqualTo(ShiftStatus.SWAPPED);
        assertThat(dto.staffUserId()).isEqualTo(replacement.getId());
        assertThat(dto.notes()).isEqualTo("Swapping for leave");
        assertThat(dto.handoverNotes()).isEqualTo("Keys in locker");
    }

    @Test
    void updateShift_requiresSwapNoteWhenRequestingSwap() {
        when(shiftRepository.findById(existingShift.getId())).thenReturn(Optional.of(existingShift));
        UpdateStaffShiftRequest request = new UpdateStaffShiftRequest(
                null,
                null,
                ShiftStatus.SWAP_REQUESTED,
                null,
                null,
                null,
                null,
                null,
                null);

        assertThatThrownBy(() -> service.updateShift(TENANT_ID, existingShift.getId(), request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Swap requests");
    }
}
