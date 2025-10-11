package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.UserGroup;
import com.afyaquik.hms.auth.dto.StaffUserDto;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.service.UserGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/group-membership")
public class UserGroupMembershipController {
    private final UserGroupService userGroupService;
    private final StaffUserRepository staffUserRepository;

    public UserGroupMembershipController(UserGroupService userGroupService, StaffUserRepository staffUserRepository) {
        this.userGroupService = userGroupService;
        this.staffUserRepository = staffUserRepository;
    }


    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<StaffUserDto>> listMembers(@PathVariable Long groupId) {
        Optional<UserGroup> group = userGroupService.findByIdWithMembers(groupId);
        return group.map(g -> ResponseEntity.ok(
            g.getMembers().stream()
                .map(m -> new StaffUserDto(m.getId(), m.getUsername(), m.getDisplayName(), m.getEmail()))
                .toList()
        )).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<?> addMembers(@PathVariable Long groupId, @RequestBody List<Long> userIds) {
        Optional<UserGroup> groupOpt = userGroupService.findByIdWithMembers(groupId);
        if (groupOpt.isEmpty()) return ResponseEntity.notFound().build();
        UserGroup group = groupOpt.get();
        List<StaffUser> users = staffUserRepository.findAllById(userIds);
        for (StaffUser user : users) {
            group.addMember(user);
        }
        userGroupService.save(group);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @PathVariable Long userId) {
        Optional<UserGroup> groupOpt = userGroupService.findById(groupId);
        Optional<StaffUser> userOpt = staffUserRepository.findById(userId);
        if (groupOpt.isEmpty() || userOpt.isEmpty()) return ResponseEntity.notFound().build();
        UserGroup group = groupOpt.get();
        StaffUser user = userOpt.get();
        group.removeMember(user);
        userGroupService.save(group);
        return ResponseEntity.noContent().build();
    }
}
