package com.afyaquik.hms.auth.security;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.repository.SuperAdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * UserDetailsService for Super Admin authentication
 * This service is used when authenticating Super Admin users
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SuperAdminUserDetailsService implements UserDetailsService {

    private final SuperAdminUserRepository superAdminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading super admin user: {}", username);
        
        SuperAdminUser user = superAdminUserRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Super admin user not found: {}", username);
                    return new UsernameNotFoundException("Super admin user not found: " + username);
                });

        if (!user.getIsActive()) {
            log.warn("Super admin user is inactive: {}", username);
            throw new UsernameNotFoundException("Super admin user is inactive: " + username);
        }

        if (user.isLocked()) {
            log.warn("Super admin user is locked: {}", username);
            throw new UsernameNotFoundException("Super admin user is locked: " + username);
        }

        log.debug("Successfully loaded super admin user: {}", username);
        return new SuperAdminUserDetails(user);
    }
}
