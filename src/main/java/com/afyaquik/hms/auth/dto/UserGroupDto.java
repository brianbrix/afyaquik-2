package com.afyaquik.hms.auth.dto;

import java.util.List;

public class UserGroupDto {
    private Long id;
    private String name;
    private String description;
    private List<MemberDto> members;

    public UserGroupDto() {}

    public UserGroupDto(Long id, String name, String description, List<MemberDto> members) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.members = members;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<MemberDto> getMembers() { return members; }
    public void setMembers(List<MemberDto> members) { this.members = members; }

    public static class MemberDto {
        private Long id;
        private String username;
        private String displayName;
        private String email;

        public MemberDto() {}
        public MemberDto(Long id, String username, String displayName, String email) {
            this.id = id;
            this.username = username;
            this.displayName = displayName;
            this.email = email;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
