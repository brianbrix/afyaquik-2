package com.afyaquik.hms.scheduling.service;

import com.afyaquik.hms.scheduling.domain.ShiftType;
import com.afyaquik.hms.scheduling.dto.ShiftTypeDto;
import com.afyaquik.hms.scheduling.repository.ShiftTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShiftTypeService {
    private final ShiftTypeRepository shiftTypeRepository;

    public ShiftTypeService(ShiftTypeRepository shiftTypeRepository) {
        this.shiftTypeRepository = shiftTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<ShiftTypeDto> list() {
        return shiftTypeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ShiftTypeDto create(ShiftTypeDto dto) {
        if (shiftTypeRepository.existsByName(dto.name())) {
            return null;
        }
        ShiftType entity = new ShiftType();
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setStartTime(dto.startTime());
        entity.setEndTime(dto.endTime());
        ShiftType saved = shiftTypeRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public ShiftTypeDto update(Long id, ShiftTypeDto dto) {
        return shiftTypeRepository.findById(id)
            .map(existing -> {
                existing.setName(dto.name());
                existing.setDescription(dto.description());
                existing.setStartTime(dto.startTime());
                existing.setEndTime(dto.endTime());
                shiftTypeRepository.save(existing);
                return toDto(existing);
            })
            .orElse(null);
    }

    @Transactional
    public boolean delete(Long id) {
        if (!shiftTypeRepository.existsById(id)) {
            return false;
        }
        shiftTypeRepository.deleteById(id);
        return true;
    }

    private ShiftTypeDto toDto(ShiftType entity) {
        return new ShiftTypeDto(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getStartTime(),
            entity.getEndTime()
        );
    }
}
