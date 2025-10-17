package com.afyaquik.hms.auth.security;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * UserDetails implementation for Super Admin users
 * Super admins have system-wide access and are not tenant-specific
 */
public class SuperAdminUserDetails implements UserDetails {

    private final SuperAdminUser user;
    private final List<GrantedAuthority> authorities;

    public SuperAdminUserDetails(SuperAdminUser user) {
        this.user = user;
        // Super admins always have SUPER_ADMIN role
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
    }

    public SuperAdminUser getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.isLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getIsActive();
    }
}
