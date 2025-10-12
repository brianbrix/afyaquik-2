package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    @Query("SELECT g.id FROM UserGroup g JOIN g.members m WHERE m.id = :userId")
    List<Long> findGroupIdsByMemberId(@Param("userId") Long userId);
    Optional<UserGroup> findByName(String name);

    @Query("SELECT DISTINCT g FROM UserGroup g LEFT JOIN FETCH g.members")
    List<UserGroup> findAllWithMembers();

    @Query("SELECT g FROM UserGroup g LEFT JOIN FETCH g.members WHERE g.id = :id")
    Optional<UserGroup> findByIdWithMembers(@Param("id") Long id);
}
