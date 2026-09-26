package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.AcademicResource;
import com.campusnexus.entity.academic.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicResourceRepository extends JpaRepository<AcademicResource, Long> {

    List<AcademicResource> findAllByDepartmentId(Long departmentId);

    List<AcademicResource> findAllByDepartmentIdAndSemester(Long departmentId, Integer semester);

    List<AcademicResource> findAllByDepartmentIdAndResourceType(Long departmentId, ResourceType resourceType);

    Optional<AcademicResource> findByIdAndDepartmentId(Long id, Long departmentId);

    List<AcademicResource> findAllByUploaderId(Long uploaderId);
}
