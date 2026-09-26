package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.FacultyReview;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class FacultyReviewDto {
    private Long id;
    private Long facultyId;
    private String facultyName;
    private Long departmentId;
    private String studentName;
    private boolean isAnonymous;
    private Integer rating;
    private String comment;
    private Integer semester;
    private LocalDateTime createdAt;

    public FacultyReviewDto() {
    }

    public static FacultyReviewDto fromEntity(FacultyReview review) {
        FacultyReviewDto dto = new FacultyReviewDto();
        dto.setId(review.getId());
        if (review.getFaculty() != null) {
            dto.setFacultyId(review.getFaculty().getId());
            dto.setFacultyName(review.getFaculty().getName());
            if (review.getFaculty().getDepartment() != null) {
                dto.setDepartmentId(review.getFaculty().getDepartment().getId());
            }
        }
        dto.setAnonymous(review.isAnonymous());
        if (review.isAnonymous()) {
            dto.setStudentName("Anonymous Student");
        } else if (review.getStudent() != null) {
            dto.setStudentName(review.getStudent().getEmail());
        }
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setSemester(review.getSemester());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public boolean isAnonymous() {
        return isAnonymous;
    }

    public void setAnonymous(boolean anonymous) {
        isAnonymous = anonymous;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class CreateRequest {
        private Long facultyId;

        private boolean isAnonymous = false;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private Integer rating;

        @NotBlank(message = "Comment is required")
        private String comment;

        private Integer semester;

        public CreateRequest() {
        }

        public Long getFacultyId() {
            return facultyId;
        }

        public void setFacultyId(Long facultyId) {
            this.facultyId = facultyId;
        }

        public boolean isAnonymous() {
            return isAnonymous;
        }

        public void setAnonymous(boolean anonymous) {
            isAnonymous = anonymous;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public Integer getSemester() {
            return semester;
        }

        public void setSemester(Integer semester) {
            this.semester = semester;
        }
    }
}
