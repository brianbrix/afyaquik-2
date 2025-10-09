package com.afyaquik.hms.auth.security;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class TenantUserDetails implements UserDetails {

    private final StaffUser user;
    private final List<GrantedAuthority> authorities;

    public TenantUserDetails(StaffUser user) {
        this.user = user;
    // Normalize role keys to uppercase so that hasRole / hasAnyRole checks (which look for ROLE_<UPPER>) succeed
    // even if stored in DB as lowercase (e.g. "reception").
    this.authorities = user.getRoles().stream()
        .map(StaffRole::getRoleKey)
        .filter(Objects::nonNull)
        .map(roleKey -> roleKey.startsWith("ROLE_") ? roleKey : "ROLE_" + roleKey)
        .map(String::toUpperCase)
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toList());
    }

    public StaffUser getUser() {
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
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
}
