package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.FacultyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyReviewRepository extends JpaRepository<FacultyReview, Long> {

    List<FacultyReview> findAllByFacultyId(Long facultyId);

    @Query("SELECT r FROM FacultyReview r WHERE r.faculty.department.id = :departmentId")
    List<FacultyReview> findAllByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT r FROM FacultyReview r WHERE r.id = :id AND r.faculty.department.id = :departmentId")
    Optional<FacultyReview> findByIdAndDepartmentId(@Param("id") Long id, @Param("departmentId") Long departmentId);
}
