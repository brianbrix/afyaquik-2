package com.afyaquik.hms.scheduling.api;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
import com.afyaquik.hms.scheduling.service.StaffSchedulingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class StaffSchedulingControllerTest {

    private static final String TENANT_HEADER = "X-Tenant-Id";

    @Mock
    private StaffSchedulingService schedulingService;

    @InjectMocks
    private StaffSchedulingController controller;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
	mockMvc = MockMvcBuilders.standaloneSetup(controller)
		.setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
		.build();
    }

	@Test
	void listShifts_returnsResults() throws Exception {
		StaffShiftDto resp = new StaffShiftDto(
			10L, // id
			77L, // staffUserId
			"Dr. Alice", // staffDisplayName
			2L, // roleId
			"Provider", // roleName
			3L, // departmentId
			"Clinic A", // departmentName
			1L, // shiftTypeId
			"Morning", // shiftTypeName
			ShiftStatus.SCHEDULED,
			OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC),
			OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC),
			"Covering",
			null);

		when(schedulingService.listShifts(eq("tenant-xyz"), any(), any(), any(), any(), any(), any(), any()))
			.thenReturn(List.of(resp));

		mockMvc.perform(get("/api/v1/scheduling/shifts")
				.header(TENANT_HEADER, "tenant-xyz"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(1)))
			.andExpect(jsonPath("$[0].staffUserId").value(77L))
			.andExpect(jsonPath("$[0].shiftTypeId").value(1L))
			.andExpect(jsonPath("$[0].roleId").value(2L))
			.andExpect(jsonPath("$[0].departmentId").value(3L));
	}

	@Test
	void createShift_persistsAndReturns201() throws Exception {
		StaffShiftDto resp = new StaffShiftDto(
			33L,
			77L,
			"Dr. Alice",
			2L,
			"Provider",
			3L,
			"Clinic A",
			1L,
			"Morning",
			ShiftStatus.SCHEDULED,
			OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC),
			OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC),
			"Covering",
			null);

		when(schedulingService.createShift(eq("tenant-xyz"), any(CreateStaffShiftRequest.class))).thenReturn(resp);

		String payload = "{" +
			"\"staffUserId\":77," +
			"\"roleId\":2," +
			"\"departmentId\":3," +
			"\"shiftTypeId\":1," +
			"\"startsAt\":\"2025-10-09T08:00:00Z\"," +
			"\"endsAt\":\"2025-10-09T14:00:00Z\"," +
			"\"notes\":\"Covering\"" +
			"}";

		mockMvc.perform(post("/api/v1/scheduling/shifts")
				.header(TENANT_HEADER, "tenant-xyz")
				.contentType(MediaType.APPLICATION_JSON)
				.content(payload))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").value(33L))
			.andExpect(jsonPath("$.roleId").value(2L))
			.andExpect(jsonPath("$.departmentId").value(3L))
			.andExpect(jsonPath("$.shiftTypeId").value(1L));
	}

	@Test
	void approveSwap_endpointInvokesService() throws Exception {
		StaffShiftDto resp = new StaffShiftDto(
			55L,
			88L,
			"Dr. Bob",
			2L,
			"Provider",
			3L,
			"Clinic A",
			1L,
			"Morning",
			ShiftStatus.SWAPPED,
			OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC),
			OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC),
			"Swapped",
			"Keys ready");

		when(schedulingService.approveSwap(eq("tenant-xyz"), anyLong(), anyLong(), any(), any())).thenReturn(resp);

		String payload = "{" +
			"\"targetStaffUserId\":88," +
			"\"note\":\"Swapped\"," +
			"\"handoverNotes\":\"Keys ready\"" +
			"}";

		mockMvc.perform(post("/api/v1/scheduling/shifts/55/swap-approve")
				.header(TENANT_HEADER, "tenant-xyz")
				.contentType(MediaType.APPLICATION_JSON)
				.content(payload))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("SWAPPED"))
			.andExpect(jsonPath("$.roleId").value(2L))
			.andExpect(jsonPath("$.departmentId").value(3L))
			.andExpect(jsonPath("$.shiftTypeId").value(1L));

		verify(schedulingService).approveSwap(eq("tenant-xyz"), eq(55L), eq(88L), eq("Swapped"), eq("Keys ready"));
	}

	@Test
	void updateShift_forwardsRequestPayload() throws Exception {
		StaffShiftDto resp = new StaffShiftDto(
			33L,
			77L,
			"Dr. Alice",
			2L,
			"Provider",
			3L,
			"Clinic A",
			1L,
			"Morning",
			ShiftStatus.CHECKED_IN,
			OffsetDateTime.of(2025, 10, 9, 8, 0, 0, 0, ZoneOffset.UTC),
			OffsetDateTime.of(2025, 10, 9, 14, 0, 0, 0, ZoneOffset.UTC),
			"Covering",
			null);
		when(schedulingService.updateShift(eq("tenant-xyz"), eq(33L), any(UpdateStaffShiftRequest.class))).thenReturn(resp);

		String payload = "{" +
			"\"status\":\"CHECKED_IN\"" +
			"}";

		mockMvc.perform(put("/api/v1/scheduling/shifts/33")
				.header(TENANT_HEADER, "tenant-xyz")
				.contentType(MediaType.APPLICATION_JSON)
				.content(payload))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("CHECKED_IN"))
			.andExpect(jsonPath("$.roleId").value(2L))
			.andExpect(jsonPath("$.departmentId").value(3L))
			.andExpect(jsonPath("$.shiftTypeId").value(1L));
	}
}
