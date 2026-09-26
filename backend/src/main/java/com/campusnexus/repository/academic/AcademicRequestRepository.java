package com.campusnexus.repository.academic;

import com.campusnexus.entity.academic.AcademicRequest;
import com.campusnexus.entity.academic.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicRequestRepository extends JpaRepository<AcademicRequest, Long> {

    List<AcademicRequest> findAllByDepartmentId(Long departmentId);

    List<AcademicRequest> findAllByDepartmentIdAndStatus(Long departmentId, RequestStatus status);

    Optional<AcademicRequest> findByIdAndDepartmentId(Long id, Long departmentId);

    List<AcademicRequest> findAllByRequesterId(Long requesterId);
}
