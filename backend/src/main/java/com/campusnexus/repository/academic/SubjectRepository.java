package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findAllByDepartmentId(Long departmentId);

    List<Subject> findAllByDepartmentIdAndSemester(Long departmentId, Integer semester);

    Optional<Subject> findByIdAndDepartmentId(Long id, Long departmentId);

    Optional<Subject> findByDepartmentIdAndCode(Long departmentId, String code);

    boolean existsByDepartmentIdAndCode(Long departmentId, String code);
}
