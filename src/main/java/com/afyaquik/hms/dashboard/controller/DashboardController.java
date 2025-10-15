package com.afyaquik.hms.dashboard.controller;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/system")
    public ApiResponse<Map<String, Object>> getSystemDashboard() {
        Map<String, Object> stats = dashboardService.getSystemDashboard();
        return ApiResponse.success(stats);
    }

    @GetMapping("/user")
    public ApiResponse<Map<String, Object>> getUserDashboard(Authentication authentication) {
        String username = authentication.getName();
        Map<String, Object> stats = dashboardService.getUserDashboard(username);
        return ApiResponse.success(stats);
    }
}

