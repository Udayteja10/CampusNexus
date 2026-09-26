package com.campusnexus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "admission_year")
    private Integer admissionYear;

    @Column(name = "regulation", length = 20)
    private String regulation;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinator_department_id")
    private Department coordinatorDepartment;

    @Column(name = "htno", unique = true, length = 20)
    private String htno;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "username", unique = true, length = 50)
    private String username;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String email, String passwordHash, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.enabled = true;
    }

    public User(String email, String passwordHash, Role role, boolean enabled) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.enabled = enabled;
    }

    public User(String email, String passwordHash, Role role, Integer admissionYear, String regulation, Integer yearOfStudy, Department department) {
        this(email, passwordHash, role, admissionYear, regulation, yearOfStudy, department, null, null);
    }

    public User(String email, String passwordHash, Role role, Integer admissionYear, String regulation, Integer yearOfStudy, Department department, String htno) {
        this(email, passwordHash, role, admissionYear, regulation, yearOfStudy, department, htno, null);
    }

    public User(String email, String passwordHash, Role role, Integer admissionYear, String regulation, Integer yearOfStudy, Department department, String htno, Department coordinatorDepartment) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.admissionYear = admissionYear;
        this.regulation = regulation;
        this.yearOfStudy = yearOfStudy;
        this.department = department;
        this.htno = htno;
        this.coordinatorDepartment = coordinatorDepartment;
        this.enabled = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public String getRegulation() {
        return regulation;
    }

    public void setRegulation(String regulation) {
        this.regulation = regulation;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Department getCoordinatorDepartment() {
        return coordinatorDepartment;
    }

    public void setCoordinatorDepartment(Department coordinatorDepartment) {
        this.coordinatorDepartment = coordinatorDepartment;
    }

    public String getHtno() {
        return htno;
    }

    public void setHtno(String htno) {
        this.htno = htno;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isStudent() {
        return this.role == Role.STUDENT;
    }

    public boolean isModerator() {
        return this.role == Role.MODERATOR;
    }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public boolean isStudentCoordinator() {
        return this.role == Role.STUDENT && this.coordinatorDepartment != null;
    }

    public boolean isInDepartment(Long departmentId) {
        return this.role == Role.STUDENT
                && this.department != null
                && this.department.getId() != null
                && this.department.getId().equals(departmentId);
    }

    public boolean isInDepartment(String departmentCode) {
        return this.role == Role.STUDENT
                && this.department != null
                && this.department.getCode() != null
                && departmentCode != null
                && departmentCode.trim().equalsIgnoreCase(this.department.getCode());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) || (id == null && Objects.equals(email, user.email));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", enabled=" + enabled +
                ", admissionYear=" + admissionYear +
                ", regulation='" + regulation + '\'' +
                ", yearOfStudy=" + yearOfStudy +
                ", department=" + (department != null ? department.getCode() : null) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
