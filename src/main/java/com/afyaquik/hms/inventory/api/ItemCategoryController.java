package com.afyaquik.hms.inventory.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.inventory.dto.ItemCategoryDto;
import com.afyaquik.hms.inventory.dto.ItemCategoryRequest;
import com.afyaquik.hms.inventory.service.ItemCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/categories")
public class ItemCategoryController {
    
    @Autowired
    private ItemCategoryService itemCategoryService;
    
    @GetMapping
    public ApiResponse<List<ItemCategoryDto>> getAllCategories() {
        return ApiResponse.success(itemCategoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ItemCategoryDto> getCategoryById(@PathVariable Long id) {
        return ApiResponse.success(itemCategoryService.getCategoryById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ItemCategoryDto>> createCategory(@Valid @RequestBody ItemCategoryRequest request) {
        ItemCategoryDto response = itemCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<ItemCategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody ItemCategoryRequest request) {
        return ApiResponse.success(itemCategoryService.updateCategory(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        itemCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

