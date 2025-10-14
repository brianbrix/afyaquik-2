package com.afyaquik.hms.profile.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.profile.dto.UserProfileDto;
import com.afyaquik.hms.profile.service.UserProfileService;

@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {
    
    private final UserProfileService userProfileService;
    
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }
    
    @GetMapping
    public ApiResponse<List<UserProfileDto>> getAllUserProfiles() {
        List<UserProfileDto> profiles = userProfileService.getAllUserProfiles();
        return ApiResponse.success(profiles);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<UserProfileDto> getUserProfileById(@PathVariable Long id) {
        Optional<UserProfileDto> profile = userProfileService.getUserProfileById(id);
        if (profile.isPresent()) {
            return ApiResponse.success(profile.get());
        } else {
            return ApiResponse.error("User profile not found");
        }
    }
    
    @GetMapping("/username/{username}")
    public ApiResponse<UserProfileDto> getUserProfileByUsername(@PathVariable String username) {
        Optional<UserProfileDto> profile = userProfileService.getUserProfileByUsername(username);
        if (profile.isPresent()) {
            return ApiResponse.success(profile.get());
        } else {
            return ApiResponse.error("User profile not found");
        }
    }
    
    @GetMapping("/email/{email}")
    public ApiResponse<UserProfileDto> getUserProfileByEmail(@PathVariable String email) {
        Optional<UserProfileDto> profile = userProfileService.getUserProfileByEmail(email);
        if (profile.isPresent()) {
            return ApiResponse.success(profile.get());
        } else {
            return ApiResponse.error("User profile not found");
        }
    }
    
    @GetMapping("/department/{department}")
    public ApiResponse<List<UserProfileDto>> getUserProfilesByDepartment(@PathVariable String department) {
        List<UserProfileDto> profiles = userProfileService.getUserProfilesByDepartment(department);
        return ApiResponse.success(profiles);
    }
    
    @GetMapping("/departments")
    public ApiResponse<List<String>> getDistinctDepartments() {
        List<String> departments = userProfileService.getDistinctDepartments();
        return ApiResponse.success(departments);
    }
    
    @GetMapping("/me")
    public ApiResponse<UserProfileDto> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        Optional<UserProfileDto> profile = userProfileService.getUserProfileByUsername(username);
        if (profile.isPresent()) {
            return ApiResponse.success(profile.get());
        } else {
            return ApiResponse.error("User profile not found");
        }
    }
    
    @PostMapping
    public ApiResponse<UserProfileDto> createUserProfile(@RequestBody UserProfileDto dto) {
        try {
            UserProfileDto created = userProfileService.createUserProfile(dto);
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create user profile: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<UserProfileDto> updateUserProfile(@PathVariable Long id, @RequestBody UserProfileDto dto) {
        try {
            Optional<UserProfileDto> updated = userProfileService.updateUserProfile(id, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("User profile not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update user profile: " + e.getMessage());
        }
    }
    
    @PutMapping("/me")
    public ApiResponse<UserProfileDto> updateCurrentUserProfile(@RequestBody UserProfileDto dto, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<UserProfileDto> updated = userProfileService.updateUserProfileByUsername(username, dto);
            if (updated.isPresent()) {
                return ApiResponse.success(updated.get());
            } else {
                return ApiResponse.error("User profile not found");
            }
        } catch (Exception e) {
            return ApiResponse.error("Failed to update user profile: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUserProfile(@PathVariable Long id) {
        boolean deleted = userProfileService.deleteUserProfile(id);
        if (deleted) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("User profile not found");
        }
    }
    
    @PutMapping("/me/last-login")
    public ApiResponse<Void> updateLastLogin(Authentication authentication) {
        String username = authentication.getName();
        boolean updated = userProfileService.updateLastLogin(username);
        if (updated) {
            return ApiResponse.success(null);
        } else {
            return ApiResponse.error("Failed to update last login");
        }
    }
    
    @PostMapping("/create-from-user")
    public ApiResponse<UserProfileDto> createProfileFromUser(@RequestBody CreateProfileRequest request) {
        try {
            UserProfileDto created = userProfileService.createProfileFromUser(
                request.getUsername(), 
                request.getEmail(), 
                request.getFirstName(), 
                request.getLastName()
            );
            return ApiResponse.success(created);
        } catch (Exception e) {
            return ApiResponse.error("Failed to create profile: " + e.getMessage());
        }
    }
    
    @GetMapping("/exists/{username}")
    public ApiResponse<Boolean> checkProfileExists(@PathVariable String username) {
        boolean exists = userProfileService.profileExists(username);
        return ApiResponse.success(exists);
    }
    
    // Inner class for request
    public static class CreateProfileRequest {
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }
}
