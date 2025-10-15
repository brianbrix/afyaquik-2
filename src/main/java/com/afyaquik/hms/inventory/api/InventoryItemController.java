package com.afyaquik.hms.inventory.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.inventory.dto.InventoryItemDto;
import com.afyaquik.hms.inventory.dto.InventoryItemRequest;
import com.afyaquik.hms.inventory.service.InventoryItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/items")
public class InventoryItemController {
    
    @Autowired
    private InventoryItemService inventoryItemService;
    
    @GetMapping
    public ApiResponse<List<InventoryItemDto>> getAllInventoryItems() {
        return ApiResponse.success(inventoryItemService.getAllInventoryItems());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<InventoryItemDto> getInventoryItemById(@PathVariable Long id) {
        return ApiResponse.success(inventoryItemService.getInventoryItemById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemDto>> createInventoryItem(@Valid @RequestBody InventoryItemRequest request) {
        InventoryItemDto response = inventoryItemService.createInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<InventoryItemDto> updateInventoryItem(@PathVariable Long id, @Valid @RequestBody InventoryItemRequest request) {
        return ApiResponse.success(inventoryItemService.updateInventoryItem(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryItem(@PathVariable Long id) {
        inventoryItemService.deleteInventoryItem(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @GetMapping("/low-stock")
    public ApiResponse<List<InventoryItemDto>> getLowStockItems() {
        return ApiResponse.success(inventoryItemService.getLowStockItems());
    }
    
    @GetMapping("/overstocked")
    public ApiResponse<List<InventoryItemDto>> getOverstockedItems() {
        return ApiResponse.success(inventoryItemService.getOverstockedItems());
    }
    
    @GetMapping("/search")
    public ApiResponse<List<InventoryItemDto>> searchInventoryItems(@RequestParam String searchTerm) {
        return ApiResponse.success(inventoryItemService.searchInventoryItems(searchTerm));
    }
}

