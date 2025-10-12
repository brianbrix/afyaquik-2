package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShiftTypeRepository extends JpaRepository<ShiftType, Long> {
    boolean existsByName(String name);
    Optional<ShiftType> findByName(String name);
}
