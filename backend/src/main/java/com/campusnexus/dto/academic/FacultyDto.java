package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.Faculty;
import jakarta.validation.constraints.NotBlank;

public class FacultyDto {
    private Long id;
    private String name;
    private String designation;
    private Long departmentId;
    private String departmentCode;
    private String email;
    private String cabinLocation;
    private String officeHours;
    private Double rating;
    private Integer reviewCount;

    public FacultyDto() {
    }

    public static FacultyDto fromEntity(Faculty faculty) {
        FacultyDto dto = new FacultyDto();
        dto.setId(faculty.getId());
        dto.setName(faculty.getName());
        dto.setDesignation(faculty.getDesignation());
        if (faculty.getDepartment() != null) {
            dto.setDepartmentId(faculty.getDepartment().getId());
            dto.setDepartmentCode(faculty.getDepartment().getCode());
        }
        dto.setEmail(faculty.getEmail());
        dto.setCabinLocation(faculty.getCabinLocation());
        dto.setOfficeHours(faculty.getOfficeHours());
        dto.setRating(faculty.getRating());
        dto.setReviewCount(faculty.getReviewCount());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCabinLocation() {
        return cabinLocation;
    }

    public void setCabinLocation(String cabinLocation) {
        this.cabinLocation = cabinLocation;
    }

    public String getOfficeHours() {
        return officeHours;
    }

    public void setOfficeHours(String officeHours) {
        this.officeHours = officeHours;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Designation is required")
        private String designation;

        private Long departmentId;

        private String email;

        private String cabinLocation;

        private String officeHours;

        public CreateRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCabinLocation() {
            return cabinLocation;
        }

        public void setCabinLocation(String cabinLocation) {
            this.cabinLocation = cabinLocation;
        }

        public String getOfficeHours() {
            return officeHours;
        }

        public void setOfficeHours(String officeHours) {
            this.officeHours = officeHours;
        }
    }
}
