package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.UserGroup;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.dto.UserGroupDto;
import com.afyaquik.hms.auth.service.UserGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-groups")
public class UserGroupController {
    private final UserGroupService userGroupService;

    public UserGroupController(UserGroupService userGroupService) {
        this.userGroupService = userGroupService;
    }

    @GetMapping
    public List<UserGroupDto> list() {
        return userGroupService.findAll().stream().map(group -> {
            List<UserGroupDto.MemberDto> members = group.getMembers() == null ? null : group.getMembers().stream().map(
                m -> new UserGroupDto.MemberDto(m.getId(), m.getUsername(), m.getDisplayName(), m.getEmail())
            ).toList();
            return new UserGroupDto(group.getId(), group.getName(), group.getDescription(), members);
        }).toList();
    }

    @PostMapping
    public UserGroup create(@RequestBody UserGroup group) {
        return userGroupService.save(group);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserGroup> update(@PathVariable Long id, @RequestBody UserGroup group) {
        return userGroupService.findById(id)
                .map(existing -> {
                    existing.setName(group.getName());
                    existing.setDescription(group.getDescription());
                    return ResponseEntity.ok(userGroupService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userGroupService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
