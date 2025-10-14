package com.afyaquik.hms.admin.api;

import com.afyaquik.hms.admin.service.QueueStatusRoleMatrixService;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminQueueConfigController {

	private final QueueStatusRoleMatrixService matrixService;

	@Autowired
	public AdminQueueConfigController(QueueStatusRoleMatrixService matrixService) {
		this.matrixService = matrixService;
	}

	// GET /admin/queue-statuses
	@GetMapping("/queue-statuses")
	public ResponseEntity<List<String>> getQueueStatuses() {
		return ResponseEntity.ok(matrixService.getAllStatuses());
	}

	// GET /admin/queue-status-role-matrix
	@GetMapping("/queue-status-role-matrix")
	public ResponseEntity<Map<String, Set<String>>> getMatrix() {
		return ResponseEntity.ok(matrixService.getMatrix());
	}

	// POST /admin/queue-status-role-matrix
	@PostMapping("/queue-status-role-matrix")
	public ResponseEntity<?> setMatrix(@RequestBody Map<String, List<String>> matrix) {
		try {
			matrixService.setMatrix(matrix);
			return ResponseEntity.ok().build();
		} catch (DataIntegrityViolationException ex) {
			return ResponseEntity.badRequest().body("Duplicate role/status entry: " + ex.getMostSpecificCause().getMessage());
		}
	}
}
