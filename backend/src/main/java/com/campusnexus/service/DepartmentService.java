package com.campusnexus.service;

import com.campusnexus.entity.Department;
import com.campusnexus.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Optional<Department> getDepartmentByCode(String code) {
        return departmentRepository.findByCode(code);
    }

    public Optional<Department> getDepartmentByCodeIgnoreCase(String code) {
        return departmentRepository.findByCodeIgnoreCase(code);
    }

    public List<Department> getAllActiveDepartments() {
        return departmentRepository.findByActiveTrue();
    }

    public boolean existsByCode(String code) {
        return departmentRepository.existsByCode(code);
    }
}
