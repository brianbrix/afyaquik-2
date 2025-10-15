package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.auth.service.SupervisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class SupervisorController {

    @Autowired
    private SupervisorService supervisorService;

    @GetMapping("/me/supervisor-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSupervisorStatus(Authentication auth) {
        String username = auth.getName();
        Map<String, Object> status = supervisorService.getSupervisorStatus(username);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
