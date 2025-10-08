package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StaffUserService {

    private final StaffUserRepository staffUserRepository;

    public StaffUserService(StaffUserRepository staffUserRepository) {
        this.staffUserRepository = staffUserRepository;
    }

    public Optional<StaffUser> findByTenantAndUsername(String tenantId, String username) {
        return staffUserRepository.findByTenantIdAndUsername(tenantId, username);
    }

    public Optional<StaffUser> findById(Long id) {
        return staffUserRepository.findById(id);
    }

    @Transactional
    public StaffUser save(StaffUser user) {
        return staffUserRepository.save(user);
    }
}
