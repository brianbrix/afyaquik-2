
package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.UserGroup;
import com.afyaquik.hms.auth.repository.UserGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserGroupService {
    private final UserGroupRepository userGroupRepository;

    @Autowired
    public UserGroupService(UserGroupRepository userGroupRepository) {
        this.userGroupRepository = userGroupRepository;
    }

    public List<UserGroup> findAll() {
        return userGroupRepository.findAllWithMembers();
    }

    public Optional<UserGroup> findById(Long id) {
        return userGroupRepository.findById(id);
    }

    public Optional<UserGroup> findByName(String name) {
        return userGroupRepository.findByName(name);
    }

    public UserGroup save(UserGroup group) {
        return userGroupRepository.save(group);
    }

    public void deleteById(Long id) {
        userGroupRepository.deleteById(id);
    }

        public Optional<UserGroup> findByIdWithMembers(Long id) {
        return userGroupRepository.findByIdWithMembers(id);
    }
}
