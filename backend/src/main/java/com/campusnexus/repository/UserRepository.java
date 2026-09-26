package com.campusnexus.repository;

import com.campusnexus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByHtno(String htno);

    boolean existsByHtno(String htno);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<User> findByCoordinatorDepartmentId(Long departmentId);

    Optional<User> findByCoordinatorDepartment(com.campusnexus.entity.Department department);

    boolean existsByCoordinatorDepartmentId(Long departmentId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.enabled = true AND u.id != :excludeUserId AND " +
           "(LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.htno) LIKE LOWER(CONCAT('%', :query, '%')))")
    java.util.List<User> searchUsersForChat(
            @org.springframework.data.repository.query.Param("query") String query,
            @org.springframework.data.repository.query.Param("excludeUserId") Long excludeUserId,
            org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("""
        SELECT u FROM User u WHERE
        (:role IS NULL OR u.role = :role) AND
        (:enabled IS NULL OR u.enabled = :enabled) AND
        (:emailVerified IS NULL OR u.emailVerified = :emailVerified) AND
        (:search IS NULL OR :search = '' OR
         LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
         LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
         LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
         LOWER(u.htno) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    org.springframework.data.domain.Page<User> findAdminUsers(
            @org.springframework.data.repository.query.Param("role") com.campusnexus.entity.Role role,
            @org.springframework.data.repository.query.Param("enabled") Boolean enabled,
            @org.springframework.data.repository.query.Param("emailVerified") Boolean emailVerified,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.department d
        WHERE u.role = com.campusnexus.entity.Role.STUDENT
          AND u.enabled = true
          AND u.emailVerified = true
          AND u.id NOT IN (
              SELECT cp.user.id FROM com.campusnexus.entity.campuslife.ClubPresident cp WHERE cp.active = true
          )
          AND (:search IS NULL OR :search = '' OR
               LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(u.htno) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY u.fullName ASC
    """)
    java.util.List<User> findEligiblePresidentCandidates(
            @org.springframework.data.repository.query.Param("search") String search
    );
}
