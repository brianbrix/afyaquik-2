package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.common.web.TenantHeaderResolver;
import com.afyaquik.hms.queue.events.QueueEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/queue")
@PreAuthorize("hasAnyRole('RECEPTION','TRIAGE','PROVIDER','PHARMACY','BILLING','ADMIN')")
public class QueueStreamController {

    private final QueueEventPublisher publisher;

    public QueueStreamController(QueueEventPublisher publisher) {
        this.publisher = publisher;
    }

}
