package com.afyaquik.hms.profile.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.profile.domain.UserProfile;
import com.afyaquik.hms.profile.dto.UserProfileDto;
import com.afyaquik.hms.profile.repository.UserProfileRepository;

@Service
@Transactional
public class UserProfileService {
    
    private final UserProfileRepository userProfileRepository;
    
    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }
    
    public List<UserProfileDto> getAllUserProfiles() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<UserProfile> profiles = userProfileRepository.findAllByTenantIdOrderByName(tenantId);
        return profiles.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public Optional<UserProfileDto> getUserProfileById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findById(id)
            .filter(profile -> tenantId.equals(profile.getTenantId()))
            .map(this::convertToDto);
    }
    
    public Optional<UserProfileDto> getUserProfileByUsername(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findByUsernameAndTenantId(username, tenantId).map(this::convertToDto);
    }
    
    public Optional<UserProfileDto> getUserProfileByEmail(String email) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findByEmailAndTenantId(email, tenantId).map(this::convertToDto);
    }
    
    public List<UserProfileDto> getUserProfilesByDepartment(String department) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<UserProfile> profiles = userProfileRepository.findByDepartmentAndTenantId(department, tenantId);
        return profiles.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<String> getDistinctDepartments() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findDistinctDepartmentsByTenantId(tenantId);
    }
    
    public UserProfileDto createUserProfile(UserProfileDto dto) {
        UserProfile profile = convertToEntity(dto);
        profile.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        
        UserProfile saved = userProfileRepository.save(profile);
        return convertToDto(saved);
    }
    
    public Optional<UserProfileDto> updateUserProfile(Long id, UserProfileDto dto) {
        return userProfileRepository.findById(id).map(existing -> {
            UserProfile updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve tenant ID
            
            UserProfile saved = userProfileRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public Optional<UserProfileDto> updateUserProfileByUsername(String username, UserProfileDto dto) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findByUsernameAndTenantId(username, tenantId).map(existing -> {
            UserProfile updated = convertToEntity(dto);
            updated.setId(existing.getId());
            updated.setTenantId(existing.getTenantId());
            
            UserProfile saved = userProfileRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteUserProfile(Long id) {
        if (!userProfileRepository.existsById(id)) {
            return false;
        }
        userProfileRepository.deleteById(id);
        return true;
    }
    
    public boolean updateLastLogin(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findByUsernameAndTenantId(username, tenantId)
            .map(profile -> {
                profile.setLastLoginAt(LocalDateTime.now());
                userProfileRepository.save(profile);
                return true;
            })
            .orElse(false);
    }
    
    public UserProfileDto createProfileFromUser(String username, String email, String firstName, String lastName) {
        // Check if profile already exists
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        if (userProfileRepository.findByUsernameAndTenantId(username, tenantId).isPresent()) {
            throw new RuntimeException("Profile already exists for user: " + username);
        }
        
        UserProfile profile = new UserProfile();
        profile.setUsername(username);
        profile.setEmail(email);
        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setTenantId(tenantId);
        
        UserProfile saved = userProfileRepository.save(profile);
        return convertToDto(saved);
    }
    
    public boolean profileExists(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return userProfileRepository.findByUsernameAndTenantId(username, tenantId).isPresent();
    }
    
    private UserProfileDto convertToDto(UserProfile profile) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(profile.getId());
        dto.setUsername(profile.getUsername());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setMiddleName(profile.getMiddleName());
        dto.setEmail(profile.getEmail());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setAlternatePhone(profile.getAlternatePhone());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setGender(profile.getGender());
        dto.setAddress(profile.getAddress());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setPostalCode(profile.getPostalCode());
        dto.setCountry(profile.getCountry());
        dto.setEmergencyContactName(profile.getEmergencyContactName());
        dto.setEmergencyContactPhone(profile.getEmergencyContactPhone());
        dto.setEmergencyContactRelationship(profile.getEmergencyContactRelationship());
        dto.setBio(profile.getBio());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setDepartment(profile.getDepartment());
        dto.setJobTitle(profile.getJobTitle());
        dto.setEmployeeId(profile.getEmployeeId());
        dto.setHireDate(profile.getHireDate());
        dto.setSupervisor(profile.getSupervisor());
        dto.setWorkLocation(profile.getWorkLocation());
        dto.setWorkPhone(profile.getWorkPhone());
        dto.setWorkEmail(profile.getWorkEmail());
        dto.setLastLoginAt(profile.getLastLoginAt());
        dto.setPreferredLanguage(profile.getPreferredLanguage());
        dto.setTimezone(profile.getTimezone());
        dto.setEmailNotifications(profile.getEmailNotifications());
        dto.setSmsNotifications(profile.getSmsNotifications());
        dto.setPushNotifications(profile.getPushNotifications());
        dto.setCreatedAt(profile.getCreatedAt() != null ? profile.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null);
        dto.setUpdatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null);
        return dto;
    }
    
    private UserProfile convertToEntity(UserProfileDto dto) {
        UserProfile profile = new UserProfile();
        profile.setId(dto.getId());
        profile.setUsername(dto.getUsername());
        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setMiddleName(dto.getMiddleName());
        profile.setEmail(dto.getEmail());
        profile.setPhoneNumber(dto.getPhoneNumber());
        profile.setAlternatePhone(dto.getAlternatePhone());
        profile.setDateOfBirth(dto.getDateOfBirth());
        profile.setGender(dto.getGender());
        profile.setAddress(dto.getAddress());
        profile.setCity(dto.getCity());
        profile.setState(dto.getState());
        profile.setPostalCode(dto.getPostalCode());
        profile.setCountry(dto.getCountry());
        profile.setEmergencyContactName(dto.getEmergencyContactName());
        profile.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        profile.setEmergencyContactRelationship(dto.getEmergencyContactRelationship());
        profile.setBio(dto.getBio());
        profile.setProfileImageUrl(dto.getProfileImageUrl());
        profile.setDepartment(dto.getDepartment());
        profile.setJobTitle(dto.getJobTitle());
        profile.setEmployeeId(dto.getEmployeeId());
        profile.setHireDate(dto.getHireDate());
        profile.setSupervisor(dto.getSupervisor());
        profile.setWorkLocation(dto.getWorkLocation());
        profile.setWorkPhone(dto.getWorkPhone());
        profile.setWorkEmail(dto.getWorkEmail());
        profile.setLastLoginAt(dto.getLastLoginAt());
        profile.setPreferredLanguage(dto.getPreferredLanguage());
        profile.setTimezone(dto.getTimezone());
        profile.setEmailNotifications(dto.getEmailNotifications());
        profile.setSmsNotifications(dto.getSmsNotifications());
        profile.setPushNotifications(dto.getPushNotifications());
        // Timestamps are handled automatically by BaseEntity
        return profile;
    }
}
