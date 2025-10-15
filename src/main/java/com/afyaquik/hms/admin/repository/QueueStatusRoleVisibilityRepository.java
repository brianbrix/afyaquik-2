package com.afyaquik.hms.admin.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.admin.entity.QueueStatusRoleVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueStatusRoleVisibilityRepository extends TenantAwareRepository<QueueStatusRoleVisibility, Long> {
	void deleteByRoleKey(String roleKey);
}
