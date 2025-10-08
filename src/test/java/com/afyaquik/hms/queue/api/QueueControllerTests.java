package com.afyaquik.hms.queue.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.queue.repository.QueueTimelineEntryRepository;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class QueueControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private VisitQueueItemRepository queueRepository;

    @Autowired
    private QueueTimelineEntryRepository timelineRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private StaffRoleRepository staffRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String bearerToken;

    @BeforeEach
    void setup() {
        timelineRepository.deleteAll();
        queueRepository.deleteAll();
        patientRepository.deleteAll();
        staffUserRepository.deleteAll();
        staffRoleRepository.deleteAll();

        StaffRole receptionRole = new StaffRole();
        receptionRole.setTenantId("tenantA");
        receptionRole.setRoleKey("RECEPTION");
        receptionRole.setDisplayName("Reception");
        StaffRole savedRole = staffRoleRepository.save(receptionRole);

        StaffUser user = new StaffUser();
        user.setTenantId("tenantA");
        user.setUsername("reception1");
        user.setDisplayName("Reception Agent");
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.addRole(savedRole);
        StaffUser savedUser = staffUserRepository.save(user);

        bearerToken = jwtService.generateAccessToken(savedUser);
    }

    @Test
    void checkInCreatesQueueItem() throws Exception {
        Patient patient = new Patient();
        patient.setTenantId("tenantA");
        patient.setMedicalRecordNumber("MRN-1");
        patient.setFirstName("John");
        patient.setLastName("Doe");
        Patient saved = patientRepository.save(patient);

    QueueCheckInRequest request = new QueueCheckInRequest(saved.getId(), "Follow-up", "MEDIUM", "OPD");

        mockMvc.perform(post("/api/v1/queue/checkin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
        .andExpect(jsonPath("$.ticketNumber").value(org.hamcrest.Matchers.containsString("TEN")))
        .andExpect(jsonPath("$.departmentId").value("OPD"));

        assertThat(patientRepository.findById(saved.getId())).isPresent();
    }

    @Test
    void listByStatusReturnsItems() throws Exception {
        Patient patient = new Patient();
        patient.setTenantId("tenantA");
        patient.setMedicalRecordNumber("MRN-1");
        patient.setFirstName("John");
        patient.setLastName("Doe");
        Long patientId = patientRepository.save(patient).getId();

    QueueCheckInRequest request = new QueueCheckInRequest(patientId, "Consultation", "HIGH", null);
        mockMvc.perform(post("/api/v1/queue/checkin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/queue")
                        .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
                        .param("status", "PENDING_CHECKIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketNumber").exists());
    }

    @Test
    void assignmentAndTransitionProduceTimeline() throws Exception {
    Patient patient = new Patient();
    patient.setTenantId("tenantA");
    patient.setMedicalRecordNumber("MRN-2");
    patient.setFirstName("Jane");
    patient.setLastName("Smith");
    Long patientId = patientRepository.save(patient).getId();

    QueueCheckInRequest request = new QueueCheckInRequest(patientId, "Triage review", "HIGH", "TRIAGE");
    mockMvc.perform(post("/api/v1/queue/checkin")
            .contentType(MediaType.APPLICATION_JSON)
            .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());

    Long queueItemId = queueRepository.findAll().get(0).getId();

    QueueAssignmentRequest assignmentRequest = new QueueAssignmentRequest("nurse-1", "Nurse Joy", "TRIAGE_NURSE", "TRIAGE", "Taking over triage");
    mockMvc.perform(post("/api/v1/queue/{id}/assign", queueItemId)
            .contentType(MediaType.APPLICATION_JSON)
            .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
            .content(objectMapper.writeValueAsString(assignmentRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.currentAssigneeId").value("nurse-1"));

    QueueTransitionRequest transitionRequest = new QueueTransitionRequest("IN_REGISTRATION", "user-1", "RECEPTION", "Receptionist Ray", "Registration started", null);
    mockMvc.perform(post("/api/v1/queue/{id}/transition", queueItemId)
            .contentType(MediaType.APPLICATION_JSON)
            .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken)
            .content(objectMapper.writeValueAsString(transitionRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("IN_REGISTRATION"))
        .andExpect(jsonPath("$.previousStatus").value("PENDING_CHECKIN"));

    mockMvc.perform(get("/api/v1/queue/{id}/timeline", queueItemId)
            .header("X-Tenant-Id", "tenantA")
            .header("Authorization", "Bearer " + bearerToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].eventType").value("CHECKED_IN"))
        .andExpect(jsonPath("$[1].eventType").value("ASSIGNED"))
        .andExpect(jsonPath("$[2].eventType").value("STATUS_CHANGED"));
    }
}
