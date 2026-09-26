package com.campusnexus.repository;

import com.campusnexus.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCode(String code);

    Optional<Department> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    List<Department> findByActiveTrue();
}
