package com.campusnexus.dto.academic;

import com.campusnexus.entity.academic.StudyGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class StudyGroupDto {
    private Long id;
    private String name;
    private String description;
    private Long departmentId;
    private String departmentCode;
    private String subjectCode;
    private String subjectName;
    private Integer semester;
    private Long leaderId;
    private String leaderEmail;
    private Integer membersCount;
    private Integer maxMembers;
    private boolean isPrivate;
    private String meetingSchedule;
    private LocalDateTime createdAt;

    public StudyGroupDto() {
    }

    public static StudyGroupDto fromEntity(StudyGroup group) {
        StudyGroupDto dto = new StudyGroupDto();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        if (group.getDepartment() != null) {
            dto.setDepartmentId(group.getDepartment().getId());
            dto.setDepartmentCode(group.getDepartment().getCode());
        }
        dto.setSubjectCode(group.getSubjectCode());
        dto.setSubjectName(group.getSubjectName());
        dto.setSemester(group.getSemester());
        if (group.getLeader() != null) {
            dto.setLeaderId(group.getLeader().getId());
            dto.setLeaderEmail(group.getLeader().getEmail());
        }
        dto.setMembersCount(group.getMembersCount());
        dto.setMaxMembers(group.getMaxMembers());
        dto.setPrivate(group.isPrivate());
        dto.setMeetingSchedule(group.getMeetingSchedule());
        dto.setCreatedAt(group.getCreatedAt());
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }

    public String getLeaderEmail() {
        return leaderEmail;
    }

    public void setLeaderEmail(String leaderEmail) {
        this.leaderEmail = leaderEmail;
    }

    public Integer getMembersCount() {
        return membersCount;
    }

    public void setMembersCount(Integer membersCount) {
        this.membersCount = membersCount;
    }

    public Integer getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public String getMeetingSchedule() {
        return meetingSchedule;
    }

    public void setMeetingSchedule(String meetingSchedule) {
        this.meetingSchedule = meetingSchedule;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class CreateRequest {
        @NotBlank(message = "Group name is required")
        private String name;

        private String description;

        private Long departmentId; // Optional for student (derived from auth)

        private String subjectCode;

        private String subjectName;

        @NotNull(message = "Semester is required")
        private Integer semester;

        private Integer maxMembers = 10;

        private boolean isPrivate = false;

        private String meetingSchedule;

        public CreateRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public void setSubjectCode(String subjectCode) {
            this.subjectCode = subjectCode;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public Integer getSemester() {
            return semester;
        }

        public void setSemester(Integer semester) {
            this.semester = semester;
        }

        public Integer getMaxMembers() {
            return maxMembers;
        }

        public void setMaxMembers(Integer maxMembers) {
            this.maxMembers = maxMembers;
        }

        public boolean isPrivate() {
            return isPrivate;
        }

        public void setPrivate(boolean aPrivate) {
            isPrivate = aPrivate;
        }

        public String getMeetingSchedule() {
            return meetingSchedule;
        }

        public void setMeetingSchedule(String meetingSchedule) {
            this.meetingSchedule = meetingSchedule;
        }
    }
}
