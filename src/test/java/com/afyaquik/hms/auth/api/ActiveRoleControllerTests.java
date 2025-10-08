package com.afyaquik.hms.auth.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.service.ActiveRoleService;
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
class ActiveRoleControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ActiveRoleService activeRoleService;

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
    void reset() {
        activeRoleService.clear();
        staffUserRepository.deleteAll();
        staffRoleRepository.deleteAll();

        StaffRole adminRole = new StaffRole();
        adminRole.setTenantId("tenantA");
        adminRole.setRoleKey("ADMIN");
        adminRole.setDisplayName("Administrator");
        StaffRole savedRole = staffRoleRepository.save(adminRole);

        StaffUser user = new StaffUser();
        user.setTenantId("tenantA");
        user.setUsername("admin1");
        user.setDisplayName("Admin One");
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.addRole(savedRole);
        StaffUser savedUser = staffUserRepository.save(user);

        bearerToken = jwtService.generateAccessToken(savedUser);
    }

    @Test
    void setActiveRoleAndRetrieve() throws Exception {
        ActiveRoleRequest request = new ActiveRoleRequest("provider");

        mockMvc.perform(post("/api/v1/auth/active-role")
                        .header("X-Tenant-Id", "tenantA")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("provider"));

        mockMvc.perform(get("/api/v1/auth/active-role")
                        .header("X-Tenant-Id", "tenantA")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("provider"));
    }

    @Test
    void getReturnsNoContentWhenNotSet() throws Exception {
        mockMvc.perform(get("/api/v1/auth/active-role")
                        .header("X-Tenant-Id", "tenantA")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void missingTenantHeaderReturnsBadRequest() throws Exception {
        ActiveRoleRequest request = new ActiveRoleRequest("triage");

        mockMvc.perform(post("/api/v1/auth/active-role")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tenantMismatchReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/auth/active-role")
                        .header("X-Tenant-Id", "otherTenant")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isForbidden());
    }
}
