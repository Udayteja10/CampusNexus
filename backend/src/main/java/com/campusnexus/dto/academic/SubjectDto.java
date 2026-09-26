package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.Subject;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubjectDto {
    private Long id;
    private String code;
    private String name;
    private Long departmentId;
    private String departmentCode;
    private Integer semester;
    private Integer credits;
    private String description;

    public SubjectDto() {
    }

    public static SubjectDto fromEntity(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        if (subject.getDepartment() != null) {
            dto.setDepartmentId(subject.getDepartment().getId());
            dto.setDepartmentCode(subject.getDepartment().getCode());
        }
        dto.setSemester(subject.getSemester());
        dto.setCredits(subject.getCredits());
        dto.setDescription(subject.getDescription());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public static class CreateRequest {
        @NotBlank(message = "Subject code is required")
        private String code;

        @NotBlank(message = "Subject name is required")
        private String name;

        private Long departmentId; // Optional for student/coordinator (derived from auth), required for admin

        @NotNull(message = "Semester is required")
        private Integer semester;

        private Integer credits = 3;

        private String description;

        public CreateRequest() {
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public Integer getSemester() {
            return semester;
        }

        public void setSemester(Integer semester) {
            this.semester = semester;
        }

        public Integer getCredits() {
            return credits;
        }

        public void setCredits(Integer credits) {
            this.credits = credits;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
