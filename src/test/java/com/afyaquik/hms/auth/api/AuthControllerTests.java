package com.afyaquik.hms.auth.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.afyaquik.hms.auth.dto.LoginRequest;
import com.afyaquik.hms.auth.dto.RefreshTokenRequest;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private StaffRoleRepository staffRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private StaffUser savedUser;

    @BeforeEach
    void setup() {
        staffUserRepository.deleteAll();
        staffRoleRepository.deleteAll();

        StaffRole role = new StaffRole();
        role.setTenantId("tenantA");
        role.setRoleKey("RECEPTION");
        role.setDisplayName("Reception");
        StaffRole savedRole = staffRoleRepository.save(role);

        StaffUser user = new StaffUser();
        user.setTenantId("tenantA");
        user.setUsername("reception");
        user.setDisplayName("Reception User");
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.addRole(savedRole);
        savedUser = staffUserRepository.save(user);
    }

    @Test
    void loginReturnsTokensAndProfile() throws Exception {
        LoginRequest request = new LoginRequest("reception", "password");

        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Tenant-Id", "tenantA")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.username").value("reception"))
                .andExpect(jsonPath("$.data.user.roles[0]").value("RECEPTION"));
    }

    @Test
    void loginWithInvalidCredentialsFails() throws Exception {
        LoginRequest request = new LoginRequest("reception", "wrong");

        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Tenant-Id", "tenantA")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void refreshIssuesNewAccessToken() throws Exception {
        LoginRequest request = new LoginRequest("reception", "password");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Tenant-Id", "tenantA")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
    String refreshToken = loginJson.get("data").get("refreshToken").asText();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Tenant-Id", "tenantA")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    void meReturnsUserProfile() throws Exception {
        String accessToken = jwtService.generateAccessToken(savedUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("X-Tenant-Id", "tenantA")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("reception"));
    }

    @Test
    void meRejectsTenantMismatch() throws Exception {
        String accessToken = jwtService.generateAccessToken(savedUser);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("X-Tenant-Id", "tenantB")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isForbidden());
    }
}
