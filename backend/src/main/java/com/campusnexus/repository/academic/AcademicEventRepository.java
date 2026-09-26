package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.AcademicEvent;
import com.campusnexus.entity.academic.EventScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicEventRepository extends JpaRepository<AcademicEvent, Long> {

    List<AcademicEvent> findAllByScope(EventScope scope);

    List<AcademicEvent> findAllByDepartmentId(Long departmentId);

    @Query("SELECT e FROM AcademicEvent e WHERE e.scope = com.campusnexus.entity.academic.EventScope.COLLEGE OR e.department.id = :departmentId")
    List<AcademicEvent> findAllCollegeEventsOrDepartmentEvents(@Param("departmentId") Long departmentId);

    @Query("SELECT e FROM AcademicEvent e WHERE e.id = :id AND (e.scope = com.campusnexus.entity.academic.EventScope.COLLEGE OR e.department.id = :departmentId)")
    Optional<AcademicEvent> findByIdAndAccessibleToDepartment(@Param("id") Long id, @Param("departmentId") Long departmentId);
}
