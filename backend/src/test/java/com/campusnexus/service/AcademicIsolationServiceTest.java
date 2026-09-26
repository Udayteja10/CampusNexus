package com.campusnexus.service;

import com.campusnexus.dto.academic.AcademicEventDto;
import com.campusnexus.dto.academic.AcademicRequestDto;
import com.campusnexus.dto.academic.AcademicResourceDto;
import com.campusnexus.dto.academic.FacultyDto;
import com.campusnexus.dto.academic.FacultyReviewDto;
import com.campusnexus.dto.academic.StudyGroupDto;
import com.campusnexus.dto.academic.SubjectDto;
import com.campusnexus.dto.academic.WikiArticleDto;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.AcademicEvent;
import com.campusnexus.entity.academic.AcademicEventType;
import com.campusnexus.entity.academic.AcademicRequest;
import com.campusnexus.entity.academic.AcademicResource;
import com.campusnexus.entity.academic.EventScope;
import com.campusnexus.entity.academic.Faculty;
import com.campusnexus.entity.academic.ResourceType;
import com.campusnexus.entity.academic.StudyGroup;
import com.campusnexus.entity.academic.Subject;
import com.campusnexus.entity.academic.WikiArticle;
import com.campusnexus.entity.academic.WikiCategory;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.academic.AcademicEventRepository;
import com.campusnexus.repository.academic.AcademicRequestRepository;
import com.campusnexus.repository.academic.AcademicResourceRepository;
import com.campusnexus.repository.academic.FacultyRepository;
import com.campusnexus.repository.academic.FacultyReviewRepository;
import com.campusnexus.repository.academic.StudyGroupRepository;
import com.campusnexus.repository.academic.SubjectRepository;
import com.campusnexus.repository.academic.WikiArticleRepository;
import com.campusnexus.service.academic.AcademicCalendarService;
import com.campusnexus.service.academic.AcademicRequestService;
import com.campusnexus.service.academic.AcademicResourceService;
import com.campusnexus.service.academic.FacultyService;
import com.campusnexus.service.academic.StudyGroupService;
import com.campusnexus.service.academic.SubjectService;
import com.campusnexus.service.academic.WikiService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class AcademicIsolationServiceTest {

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private AcademicResourceService resourceService;

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private StudyGroupService studyGroupService;

    @Autowired
    private AcademicRequestService requestService;

    @Autowired
    private AcademicCalendarService calendarService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicResourceRepository resourceRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private FacultyReviewRepository facultyReviewRepository;

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private AcademicRequestRepository academicRequestRepository;

    @Autowired
    private AcademicEventRepository eventRepository;

    @Autowired
    private WikiArticleRepository wikiRepository;

    private Department cseDept;
    private Department eceDept;

    private User cseStudent;
    private User eceStudent;
    private User cseCoordinator;
    private User moderator;
    private User admin;
    private User noDeptStudent;

    private Subject cseSubject;
    private Subject eceSubject;
    private AcademicResource cseResource;
    private AcademicResource eceResource;
    private Faculty cseFaculty;
    private Faculty eceFaculty;
    private StudyGroup eceGroup;
    private AcademicRequest eceRequest;
    private AcademicEvent collegeEvent;
    private AcademicEvent cseEvent;
    private AcademicEvent eceEvent;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        // 1. CSE Student
        cseStudent = userRepository.save(new User("service.cse.student@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0281"));

        // 2. ECE Student
        eceStudent = userRepository.save(new User("service.ece.student@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, eceDept, "23R21A0481"));

        // 3. CSE Coordinator
        cseCoordinator = userRepository.save(new User("service.cse.coord@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0282", cseDept));

        // 4. Moderator
        moderator = userRepository.save(new User("service.mod@campusnexus.com", "$2a$10$dummyHash", Role.MODERATOR));

        // 5. Admin
        admin = userRepository.save(new User("service.admin@campusnexus.com", "$2a$10$dummyHash", Role.ADMIN));

        // 6. Student without Department
        noDeptStudent = userRepository.save(new User("service.nodept@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT));

        // Seed domain data
        cseSubject = subjectRepository.save(new Subject("CS501PC", "DBMS", cseDept, 5, 3, "Database Systems"));
        eceSubject = subjectRepository.save(new Subject("EC501PC", "DSP", eceDept, 5, 3, "Digital Signal Processing"));

        cseResource = resourceRepository.save(new AcademicResource("DBMS Notes", "Unit 1", cseDept, cseSubject, "CS501PC", "DBMS", 5, ResourceType.NOTE, "https://example.com/dbms.pdf", "pdf", 1024L, cseStudent));
        eceResource = resourceRepository.save(new AcademicResource("DSP Notes", "Unit 1", eceDept, eceSubject, "EC501PC", "DSP", 5, ResourceType.NOTE, "https://example.com/dsp.pdf", "pdf", 2048L, eceStudent));

        cseFaculty = facultyRepository.save(new Faculty("Dr. CSE Prof", "Professor", cseDept, "cse.prof@campusnexus.com", "B-301", "2-4 PM"));
        eceFaculty = facultyRepository.save(new Faculty("Dr. ECE Prof", "Professor", eceDept, "ece.prof@campusnexus.com", "C-201", "1-3 PM"));

        studyGroupRepository.save(new StudyGroup("CSE AI Group", "AI Study", cseDept, "CS501PC", "DBMS", 5, cseStudent, 10, false, "Tue 6 PM"));
        eceGroup = studyGroupRepository.save(new StudyGroup("ECE Signals Group", "Signals Study", eceDept, "EC501PC", "DSP", 5, eceStudent, 10, false, "Wed 6 PM"));

        academicRequestRepository.save(new AcademicRequest("Need DBMS PYQ", "2023 papers", cseDept, "CS501PC", "DBMS", 5, ResourceType.PYQ, cseStudent));
        eceRequest = academicRequestRepository.save(new AcademicRequest("Need DSP Manual", "Lab manual", eceDept, "EC501PC", "DSP", 5, ResourceType.LAB_MANUAL, eceStudent));

        collegeEvent = eventRepository.save(new AcademicEvent("Annual Fest", "Campus Fest", EventScope.COLLEGE, null, AcademicEventType.FEST, LocalDateTime.now(), LocalDateTime.now().plusDays(2), "Auditorium", true));
        cseEvent = eventRepository.save(new AcademicEvent("CSE Hackathon", "Code Fest", EventScope.DEPARTMENT, cseDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "CSE Lab", true));
        eceEvent = eventRepository.save(new AcademicEvent("ECE Expo", "Robotics", EventScope.DEPARTMENT, eceDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "ECE Lab", false));

        wikiRepository.save(new WikiArticle("service-campus-guide", "Campus Navigation", "Content", WikiCategory.CAMPUS_GUIDE, null, cseStudent));
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        facultyReviewRepository.deleteAll();
        resourceRepository.deleteAll();
        academicRequestRepository.deleteAll();
        studyGroupRepository.deleteAll();
        subjectRepository.deleteAll();
        facultyRepository.deleteAll();
        eventRepository.deleteAll();
        wikiRepository.deleteAll();
        userRepository.findByEmail("service.cse.student@campusnexus.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("service.ece.student@campusnexus.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("service.cse.coord@campusnexus.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("service.mod@campusnexus.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("service.admin@campusnexus.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("service.nodept@campusnexus.com").ifPresent(userRepository::delete);
    }

    private Authentication createAuth(User user) {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isEnabled(),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Test
    @DisplayName("CSE Student should see only CSE resources and fail on direct ECE resource ID")
    void testResourceServiceIsolation() {
        Authentication cseAuth = createAuth(cseStudent);
        List<AcademicResourceDto> cseList = resourceService.getResources(cseAuth, null, null, null);
        assertThat(cseList).extracting(AcademicResourceDto::getTitle).contains("DBMS Notes").doesNotContain("DSP Notes");

        AcademicResourceDto directCse = resourceService.getResourceById(cseAuth, cseResource.getId());
        assertThat(directCse.getTitle()).isEqualTo("DBMS Notes");

        assertThatThrownBy(() -> resourceService.getResourceById(cseAuth, eceResource.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("CSE Student should see only CSE subjects and fail on direct ECE subject ID")
    void testSubjectServiceIsolation() {
        Authentication cseAuth = createAuth(cseStudent);
        List<SubjectDto> cseList = subjectService.getSubjects(cseAuth, null, null);
        assertThat(cseList).extracting(SubjectDto::getCode).contains("CS501PC").doesNotContain("EC501PC");

        SubjectDto directCse = subjectService.getSubjectById(cseAuth, cseSubject.getId());
        assertThat(directCse.getCode()).isEqualTo("CS501PC");

        assertThatThrownBy(() -> subjectService.getSubjectById(cseAuth, eceSubject.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("CSE Student should see only CSE faculty and cannot review ECE faculty")
    void testFacultyAndReviewServiceIsolation() {
        Authentication cseAuth = createAuth(cseStudent);
        List<FacultyDto> cseList = facultyService.getFacultyList(cseAuth, null);
        assertThat(cseList).extracting(FacultyDto::getName).contains("Dr. CSE Prof").doesNotContain("Dr. ECE Prof");

        FacultyDto directCse = facultyService.getFacultyById(cseAuth, cseFaculty.getId());
        assertThat(directCse.getName()).isEqualTo("Dr. CSE Prof");

        assertThatThrownBy(() -> facultyService.getFacultyById(cseAuth, eceFaculty.getId()))
                .isInstanceOf(AccessDeniedException.class);

        // Review creation
        FacultyReviewDto.CreateRequest validReview = new FacultyReviewDto.CreateRequest();
        validReview.setFacultyId(cseFaculty.getId());
        validReview.setRating(5);
        validReview.setComment("Excellent teaching");
        FacultyReviewDto createdReview = facultyService.createReview(cseAuth, validReview);
        assertThat(createdReview.getRating()).isEqualTo(5);

        FacultyReviewDto.CreateRequest invalidReview = new FacultyReviewDto.CreateRequest();
        invalidReview.setFacultyId(eceFaculty.getId());
        invalidReview.setRating(5);
        invalidReview.setComment("Cross dept review attempt");
        assertThatThrownBy(() -> facultyService.createReview(cseAuth, invalidReview))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("CSE Student should see only CSE study groups and requests")
    void testStudyGroupAndRequestServiceIsolation() {
        Authentication cseAuth = createAuth(cseStudent);

        List<StudyGroupDto> cseGroups = studyGroupService.getStudyGroups(cseAuth, null, null);
        assertThat(cseGroups).extracting(StudyGroupDto::getName).contains("CSE AI Group").doesNotContain("ECE Signals Group");

        assertThatThrownBy(() -> studyGroupService.getStudyGroupById(cseAuth, eceGroup.getId()))
                .isInstanceOf(AccessDeniedException.class);

        List<AcademicRequestDto> cseReqs = requestService.getRequests(cseAuth, null, null);
        assertThat(cseReqs).extracting(AcademicRequestDto::getTitle).contains("Need DBMS PYQ").doesNotContain("Need DSP Manual");

        assertThatThrownBy(() -> requestService.getRequestById(cseAuth, eceRequest.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("CSE Student sees College + CSE events and is denied from ECE events")
    void testAcademicCalendarServiceIsolation() {
        Authentication cseAuth = createAuth(cseStudent);

        List<AcademicEventDto> cseEvents = calendarService.getEvents(cseAuth, null);
        assertThat(cseEvents).extracting(AcademicEventDto::getTitle)
                .contains("Annual Fest", "CSE Hackathon")
                .doesNotContain("ECE Expo");

        AcademicEventDto directCollege = calendarService.getEventById(cseAuth, collegeEvent.getId());
        assertThat(directCollege.getTitle()).isEqualTo("Annual Fest");

        AcademicEventDto directCse = calendarService.getEventById(cseAuth, cseEvent.getId());
        assertThat(directCse.getTitle()).isEqualTo("CSE Hackathon");

        assertThatThrownBy(() -> calendarService.getEventById(cseAuth, eceEvent.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Shared Wiki is globally accessible to all personas")
    void testWikiServiceGlobalAccess() {
        Authentication cseAuth = createAuth(cseStudent);
        Authentication eceAuth = createAuth(eceStudent);
        Authentication modAuth = createAuth(moderator);
        Authentication adminAuth = createAuth(admin);
        Authentication noDeptAuth = createAuth(noDeptStudent);

        assertThat(wikiService.getWikiArticles(cseAuth, null)).isNotEmpty();
        assertThat(wikiService.getWikiArticles(eceAuth, null)).isNotEmpty();
        assertThat(wikiService.getWikiArticles(modAuth, null)).isNotEmpty();
        assertThat(wikiService.getWikiArticles(adminAuth, null)).isNotEmpty();
        assertThat(wikiService.getWikiArticles(noDeptAuth, null)).isNotEmpty();

        WikiArticleDto article = wikiService.getWikiArticleBySlug(cseAuth, "service-campus-guide");
        assertThat(article.getTitle()).isEqualTo("Campus Navigation");
    }

    @Test
    @DisplayName("Student Coordinator academic scope remains strictly their own academic department")
    void testStudentCoordinatorAcademicScope() {
        Authentication coordAuth = createAuth(cseCoordinator);

        List<SubjectDto> subjects = subjectService.getSubjects(coordAuth, null, null);
        assertThat(subjects).extracting(SubjectDto::getCode).contains("CS501PC").doesNotContain("EC501PC");

        assertThatThrownBy(() -> subjectService.getSubjectById(coordAuth, eceSubject.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Student with null department fails closed for all department-scoped services")
    void testNullDepartmentStudentFailsClosed() {
        Authentication noDeptAuth = createAuth(noDeptStudent);

        assertThatThrownBy(() -> subjectService.getSubjects(noDeptAuth, null, null))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> resourceService.getResources(noDeptAuth, null, null, null))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> facultyService.getFacultyList(noDeptAuth, null))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> studyGroupService.getStudyGroups(noDeptAuth, null, null))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> requestService.getRequests(noDeptAuth, null, null))
                .isInstanceOf(AccessDeniedException.class);

        // Calendar allows college events only
        List<AcademicEventDto> events = calendarService.getEvents(noDeptAuth, null);
        assertThat(events).extracting(AcademicEventDto::getTitle).contains("Annual Fest").doesNotContain("CSE Hackathon", "ECE Expo");
    }

    @Test
    @DisplayName("Moderator and Admin have global access across departments")
    void testModeratorAndAdminGlobalAccess() {
        Authentication modAuth = createAuth(moderator);
        Authentication adminAuth = createAuth(admin);

        assertThat(subjectService.getSubjects(modAuth, null, null)).hasSize(2);
        assertThat(subjectService.getSubjects(adminAuth, null, null)).hasSize(2);

        assertThat(resourceService.getResourceById(modAuth, eceResource.getId())).isNotNull();
        assertThat(resourceService.getResourceById(adminAuth, cseResource.getId())).isNotNull();

        assertThat(facultyService.getFacultyById(modAuth, eceFaculty.getId())).isNotNull();
        assertThat(facultyService.getFacultyById(adminAuth, cseFaculty.getId())).isNotNull();
    }
}
