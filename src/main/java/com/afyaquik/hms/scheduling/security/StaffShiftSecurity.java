package com.afyaquik.hms.scheduling.security;

import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class StaffShiftSecurity {

    private final StaffShiftRepository shiftRepository;

    public StaffShiftSecurity(StaffShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    /**
     * Returns true if the authenticated user is the owner (assigned staff member) of the shift.
     */
    public boolean isOwner(Long shiftId, Authentication authentication) {
        if (shiftId == null || authentication == null || authentication.getName() == null) {
            return false;
        }
        // We assume the staff user id is stored as principal name or a numeric value parseable from it.
        try {
            Long authUserId = Long.parseLong(authentication.getName());
            return shiftRepository.findById(shiftId)
                    .map(s -> s.getStaffUser().getId().equals(authUserId))
                    .orElse(false);
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    /**
     * Returns true if user has any manager authority: ADMIN, RECEPTION, or SCHEDULING_MANAGER.
     */
    public boolean isManager(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_RECEPTION") || a.equals("ROLE_SCHEDULING_MANAGER"));
    }

    /**
     * Composite check for swap requests: owner (assigned staff) OR manager roles.
     */
    public boolean canRequestSwap(Long shiftId, Authentication authentication) {
        return isOwner(shiftId, authentication) || isManager(authentication);
    }
}
