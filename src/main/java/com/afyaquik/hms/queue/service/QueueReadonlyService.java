package com.afyaquik.hms.queue.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;

@Service
@Transactional(readOnly = true)
public class QueueReadonlyService {

    @Autowired
    private VisitQueueItemRepository queueRepository;

    @Autowired
    private BillRepository billRepository;

    /**
     * Check if a queue item is in readonly mode.
     * A queue item is readonly if:
     * 1. The queue status is CLOSED, AND
     * 2. All bills for this queue item are fully paid (status = PAID)
     */
    public boolean isQueueItemReadonly(Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if queue item exists and is closed
        return queueRepository.findById(queueItemId)
            .map(queueItem -> {
                // Check if queue item is closed
                if (queueItem.getCurrentStatus() != QueueStatus.CLOSED) {
                    return false;
                }
                
                // Check if all bills for this queue item are fully paid
                List<com.afyaquik.hms.billing.domain.Bill> bills = 
                    billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
                
                if (bills.isEmpty()) {
                    // No bills exist, so not readonly
                    return false;
                }
                
                // Check if all bills are fully paid
                return bills.stream()
                    .allMatch(bill -> bill.getStatus() == BillStatus.PAID);
            })
            .orElse(false);
    }

    /**
     * Check if a queue item has any bills that are fully paid.
     * This is a helper method to check if billing is complete.
     */
    public boolean hasFullyPaidBills(Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        List<com.afyaquik.hms.billing.domain.Bill> bills = 
            billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
        
        return bills.stream()
            .anyMatch(bill -> bill.getStatus() == BillStatus.PAID);
    }

    /**
     * Check if a queue item is closed.
     */
    public boolean isQueueItemClosed(Long queueItemId) {
        return queueRepository.findById(queueItemId)
            .map(queueItem -> queueItem.getCurrentStatus() == QueueStatus.CLOSED)
            .orElse(false);
    }
}
