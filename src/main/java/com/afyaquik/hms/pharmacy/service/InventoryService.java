package com.afyaquik.hms.pharmacy.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.pharmacy.domain.Inventory;
import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.pharmacy.dto.InventoryDto;
import com.afyaquik.hms.pharmacy.repository.InventoryRepository;
import com.afyaquik.hms.pharmacy.repository.MedicationRepository;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicationRepository medicationRepository;

    public InventoryService(InventoryRepository inventoryRepository, MedicationRepository medicationRepository) {
        this.inventoryRepository = inventoryRepository;
        this.medicationRepository = medicationRepository;
    }

    public InventoryDto create(String tenantId, Long medicationId, InventoryDto request) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalStateException("Medication not found"));

        if (!medication.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Medication not found");
        }

        // Check if inventory already exists for this medication
        if (inventoryRepository.findByTenantIdAndMedication(tenantId, medication).isPresent()) {
            throw new IllegalStateException("Inventory already exists for this medication");
        }

        Inventory inventory = new Inventory();
        mapDtoToEntity(request, inventory);
        inventory.setTenantId(tenantId);
        inventory.setMedication(medication);

        Inventory saved = inventoryRepository.save(inventory);
        return mapEntityToDto(saved);
    }

    public InventoryDto update(String tenantId, Long id, InventoryDto request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Inventory not found"));

        if (!inventory.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Inventory not found");
        }

        mapDtoToEntity(request, inventory);
        Inventory saved = inventoryRepository.save(inventory);
        return mapEntityToDto(saved);
    }

    @Transactional(readOnly = true)
    public InventoryDto getById(String tenantId, Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Inventory not found"));

        if (!inventory.getTenantId().equals(tenantId) || inventory.isDeleted()) {
            throw new IllegalStateException("Inventory not found");
        }

        return mapEntityToDto(inventory);
    }

    @Transactional(readOnly = true)
    public InventoryDto getByMedicationId(String tenantId, Long medicationId) {
        Inventory inventory = inventoryRepository.findByTenantIdAndMedicationId(tenantId, medicationId)
                .orElseThrow(() -> new IllegalStateException("Inventory not found for medication"));

        return mapEntityToDto(inventory);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getAll(String tenantId) {
        return inventoryRepository.findByTenantIdAndNotDeleted(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto> getAll(String tenantId, Pageable pageable) {
        return inventoryRepository.findByTenantIdAndNotDeleted(tenantId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getLowStock(String tenantId) {
        return inventoryRepository.findLowStockByTenantId(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto> getLowStock(String tenantId, Pageable pageable) {
        return inventoryRepository.findLowStockByTenantId(tenantId, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getNeedingReorder(String tenantId) {
        return inventoryRepository.findNeedingReorderByTenantId(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getExpiring(String tenantId, int days) {
        LocalDate expiryDate = LocalDate.now().plusDays(days);
        return inventoryRepository.findExpiringByTenantId(tenantId, expiryDate)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto> getExpiring(String tenantId, int days, Pageable pageable) {
        LocalDate expiryDate = LocalDate.now().plusDays(days);
        return inventoryRepository.findExpiringByTenantId(tenantId, expiryDate, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getExpired(String tenantId) {
        return inventoryRepository.findExpiredByTenantId(tenantId)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> search(String tenantId, String searchTerm) {
        return inventoryRepository.searchByTenantId(tenantId, searchTerm)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto> search(String tenantId, String searchTerm, Pageable pageable) {
        return inventoryRepository.searchByTenantId(tenantId, searchTerm, pageable)
                .map(this::mapEntityToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getBySupplier(String tenantId, String supplier) {
        return inventoryRepository.findByTenantIdAndSupplier(tenantId, supplier)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getByLocation(String tenantId, String location) {
        return inventoryRepository.findByTenantIdAndLocation(tenantId, location)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getSuppliers(String tenantId) {
        return inventoryRepository.findDistinctSuppliersByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<String> getLocations(String tenantId) {
        return inventoryRepository.findDistinctLocationsByTenantId(tenantId);
    }

    public InventoryDto adjustStock(String tenantId, Long id, int quantityChange, String notes) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Inventory not found"));

        if (!inventory.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Inventory not found");
        }

        int newQuantity = inventory.getQuantityInStock() + quantityChange;
        if (newQuantity < 0) {
            throw new IllegalStateException("Insufficient stock. Current stock: " + inventory.getQuantityInStock());
        }

        inventory.setQuantityInStock(newQuantity);
        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = inventory.getNotes();
            String newNotes = existingNotes != null ? existingNotes + "\n" + notes : notes;
            inventory.setNotes(newNotes);
        }

        Inventory saved = inventoryRepository.save(inventory);
        return mapEntityToDto(saved);
    }

    public void delete(String tenantId, Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Inventory not found"));

        if (!inventory.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Inventory not found");
        }

        inventory.softDelete();
        inventoryRepository.save(inventory);
    }

    private void mapDtoToEntity(InventoryDto dto, Inventory inventory) {
        inventory.setQuantityInStock(dto.getQuantityInStock());
        inventory.setMinimumStockLevel(dto.getMinimumStockLevel());
        inventory.setMaximumStockLevel(dto.getMaximumStockLevel());
        inventory.setReorderPoint(dto.getReorderPoint());
        inventory.setReorderQuantity(dto.getReorderQuantity());
        inventory.setUnitCost(dto.getUnitCost());
        inventory.setExpiryDate(dto.getExpiryDate());
        inventory.setBatchNumber(dto.getBatchNumber());
        inventory.setSupplier(dto.getSupplier());
        inventory.setLocation(dto.getLocation());
        inventory.setNotes(dto.getNotes());
    }

    private InventoryDto mapEntityToDto(Inventory inventory) {
        InventoryDto dto = new InventoryDto();
        dto.setId(inventory.getId());
        dto.setMedicationId(inventory.getMedication().getId());
        dto.setMedicationName(inventory.getMedication().getName());
        dto.setMedicationCode(inventory.getMedication().getMedicationCode());
        dto.setQuantityInStock(inventory.getQuantityInStock());
        dto.setMinimumStockLevel(inventory.getMinimumStockLevel());
        dto.setMaximumStockLevel(inventory.getMaximumStockLevel());
        dto.setReorderPoint(inventory.getReorderPoint());
        dto.setReorderQuantity(inventory.getReorderQuantity());
        dto.setUnitCost(inventory.getUnitCost());
        dto.setExpiryDate(inventory.getExpiryDate());
        dto.setBatchNumber(inventory.getBatchNumber());
        dto.setSupplier(inventory.getSupplier());
        dto.setLocation(inventory.getLocation());
        dto.setNotes(inventory.getNotes());
        dto.setLowStock(inventory.isLowStock());
        dto.setNeedsReorder(inventory.needsReorder());
        dto.setExpired(inventory.isExpired());
        dto.setExpiringSoon(inventory.isExpiringSoon(30)); // 30 days
        dto.setCreatedAt(inventory.getCreatedAt());
        dto.setUpdatedAt(inventory.getUpdatedAt());
        return dto;
    }
}

