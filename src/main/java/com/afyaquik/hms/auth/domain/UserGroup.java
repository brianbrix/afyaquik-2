package com.afyaquik.hms.auth.domain;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_groups")
public class UserGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String name;

    @Column(length = 256)
    private String description;

    @ManyToMany
    @JoinTable(
        name = "user_group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "staff_user_id")
    )
    private Set<StaffUser> members = new HashSet<>();

    public Set<StaffUser> getMembers() { return members; }
    public void setMembers(Set<StaffUser> members) { this.members = members; }
    public void addMember(StaffUser user) { this.members.add(user); }
    public void removeMember(StaffUser user) { this.members.remove(user); }

    public UserGroup() {}

    public UserGroup(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
