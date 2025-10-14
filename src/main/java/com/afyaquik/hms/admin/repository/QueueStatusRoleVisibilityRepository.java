package com.afyaquik.hms.admin.repository;

import com.afyaquik.hms.admin.entity.QueueStatusRoleVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueStatusRoleVisibilityRepository extends JpaRepository<QueueStatusRoleVisibility, Long> {
	void deleteByRoleKey(String roleKey);
}
