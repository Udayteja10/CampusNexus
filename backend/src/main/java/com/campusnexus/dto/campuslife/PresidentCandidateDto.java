package com.campusnexus.dto.campuslife;

import com.campusnexus.entity.User;

public class PresidentCandidateDto {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String htno;
    private String departmentCode;
    private String departmentName;
    private Integer yearOfStudy;

    public PresidentCandidateDto() {}

    public PresidentCandidateDto(Long id, String fullName, String username, String email, String htno,
                                 String departmentCode, String departmentName, Integer yearOfStudy) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.htno = htno;
        this.departmentCode = departmentCode;
        this.departmentName = departmentName;
        this.yearOfStudy = yearOfStudy;
    }

    public static PresidentCandidateDto fromUser(User user) {
        if (user == null) return null;
        String deptCode = user.getDepartment() != null ? user.getDepartment().getCode() : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;
        return new PresidentCandidateDto(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getHtno(),
                deptCode,
                deptName,
                user.getYearOfStudy()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHtno() {
        return htno;
    }

    public void setHtno(String htno) {
        this.htno = htno;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }
}
