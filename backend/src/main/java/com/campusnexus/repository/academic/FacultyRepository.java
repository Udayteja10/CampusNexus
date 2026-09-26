package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    List<Faculty> findAllByDepartmentId(Long departmentId);

    Optional<Faculty> findByIdAndDepartmentId(Long id, Long departmentId);
}
