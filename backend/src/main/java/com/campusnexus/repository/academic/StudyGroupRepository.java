package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findAllByDepartmentId(Long departmentId);

    List<StudyGroup> findAllByDepartmentIdAndSemester(Long departmentId, Integer semester);

    Optional<StudyGroup> findByIdAndDepartmentId(Long id, Long departmentId);

    List<StudyGroup> findAllByLeaderId(Long leaderId);
}
