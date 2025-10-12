package com.afyaquik.hms.notification.repository;

import com.afyaquik.hms.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
