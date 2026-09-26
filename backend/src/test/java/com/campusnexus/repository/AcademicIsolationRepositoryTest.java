package com.campusnexus.repository;

import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.academic.AcademicEvent;
import com.campusnexus.entity.academic.AcademicRequest;
import com.campusnexus.entity.academic.AcademicResource;
import com.campusnexus.entity.academic.AcademicEventType;
import com.campusnexus.entity.academic.EventScope;
import com.campusnexus.entity.academic.Faculty;
import com.campusnexus.entity.academic.FacultyReview;
import com.campusnexus.entity.academic.ResourceType;
import com.campusnexus.entity.academic.StudyGroup;
import com.campusnexus.entity.academic.Subject;
import com.campusnexus.entity.academic.WikiArticle;
import com.campusnexus.entity.academic.WikiCategory;
import com.campusnexus.repository.academic.AcademicEventRepository;
import com.campusnexus.repository.academic.AcademicRequestRepository;
import com.campusnexus.repository.academic.AcademicResourceRepository;
import com.campusnexus.repository.academic.FacultyRepository;
import com.campusnexus.repository.academic.FacultyReviewRepository;
import com.campusnexus.repository.academic.StudyGroupRepository;
import com.campusnexus.repository.academic.SubjectRepository;
import com.campusnexus.repository.academic.WikiArticleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AcademicIsolationRepositoryTest {

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
    private AcademicRequestRepository requestRepository;

    @Autowired
    private AcademicEventRepository eventRepository;

    @Autowired
    private WikiArticleRepository wikiRepository;

    private Department cseDept;
    private Department eceDept;
    private User testUser;

    private Subject eceSubject;
    private AcademicResource eceResource;
    private Faculty eceFaculty;
    private FacultyReview eceReview;
    private StudyGroup eceGroup;
    private AcademicRequest eceRequest;
    private AcademicEvent collegeEvent;
    private AcademicEvent eceEvent;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        testUser = new User("repo.test.user@campusnexus.com", "$2a$10$dummyHash", Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0289");
        testUser = userRepository.save(testUser);

        // Subjects
        subjectRepository.save(new Subject("CS501PC", "DBMS", cseDept, 5, 3, "Database Systems"));
        eceSubject = subjectRepository.save(new Subject("EC501PC", "DSP", eceDept, 5, 3, "Digital Signal Processing"));

        // Resources
        resourceRepository.save(new AcademicResource("DBMS Notes", "Unit 1", cseDept, null, "CS501PC", "DBMS", 5, ResourceType.NOTE, "https://example.com/dbms.pdf", "pdf", 1024L, testUser));
        eceResource = resourceRepository.save(new AcademicResource("DSP Notes", "Unit 1", eceDept, eceSubject, "EC501PC", "DSP", 5, ResourceType.NOTE, "https://example.com/dsp.pdf", "pdf", 2048L, testUser));

        // Faculty & Reviews
        Faculty cseFaculty = facultyRepository.save(new Faculty("Dr. CSE Prof", "Professor", cseDept, "cse.prof@campusnexus.com", "B-301", "2-4 PM"));
        eceFaculty = facultyRepository.save(new Faculty("Dr. ECE Prof", "Professor", eceDept, "ece.prof@campusnexus.com", "C-201", "1-3 PM"));

        facultyReviewRepository.save(new FacultyReview(cseFaculty, testUser, false, 5, "Great teacher", 5));
        eceReview = facultyReviewRepository.save(new FacultyReview(eceFaculty, testUser, true, 4, "Good lab guidance", 5));

        // Study Groups
        studyGroupRepository.save(new StudyGroup("CSE AI Group", "AI Study", cseDept, "CS501PC", "DBMS", 5, testUser, 10, false, "Tue 6 PM"));
        eceGroup = studyGroupRepository.save(new StudyGroup("ECE Signals Group", "Signals Study", eceDept, "EC501PC", "DSP", 5, testUser, 10, false, "Wed 6 PM"));

        // Academic Requests
        requestRepository.save(new AcademicRequest("Need DBMS PYQ", "2023 papers", cseDept, "CS501PC", "DBMS", 5, ResourceType.PYQ, testUser));
        eceRequest = requestRepository.save(new AcademicRequest("Need DSP Manual", "Lab manual", eceDept, "EC501PC", "DSP", 5, ResourceType.LAB_MANUAL, testUser));

        // Events
        collegeEvent = eventRepository.save(new AcademicEvent("Annual Fest", "Campus Fest", EventScope.COLLEGE, null, AcademicEventType.FEST, LocalDateTime.now(), LocalDateTime.now().plusDays(2), "Main Auditorium", true));
        eventRepository.save(new AcademicEvent("CSE Hackathon", "Code Fest", EventScope.DEPARTMENT, cseDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "CSE Lab 3", true));
        eceEvent = eventRepository.save(new AcademicEvent("ECE Robotics Expo", "Robotics", EventScope.DEPARTMENT, eceDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "ECE Lab 1", false));

        // Wiki
        wikiRepository.save(new WikiArticle("repo-campus-guide", "Campus Navigation Guide", "Full campus guide", WikiCategory.CAMPUS_GUIDE, null, testUser));
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        facultyReviewRepository.deleteAll();
        resourceRepository.deleteAll();
        requestRepository.deleteAll();
        studyGroupRepository.deleteAll();
        subjectRepository.deleteAll();
        facultyRepository.deleteAll();
        eventRepository.deleteAll();
        wikiRepository.deleteAll();
        userRepository.findByEmail("repo.test.user@campusnexus.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("SubjectRepository should filter by departmentId and reject cross-department direct query")
    void testSubjectRepositoryIsolation() {
        List<Subject> cseList = subjectRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseList).extracting(Subject::getCode).contains("CS501PC").doesNotContain("EC501PC");

        List<Subject> eceList = subjectRepository.findAllByDepartmentId(eceDept.getId());
        assertThat(eceList).extracting(Subject::getCode).contains("EC501PC").doesNotContain("CS501PC");

        Optional<Subject> crossDept = subjectRepository.findByIdAndDepartmentId(eceSubject.getId(), cseDept.getId());
        assertThat(crossDept).isEmpty();
    }

    @Test
    @DisplayName("AcademicResourceRepository should filter by departmentId and reject cross-department direct query")
    void testResourceRepositoryIsolation() {
        List<AcademicResource> cseList = resourceRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseList).extracting(AcademicResource::getTitle).contains("DBMS Notes").doesNotContain("DSP Notes");

        Optional<AcademicResource> crossDept = resourceRepository.findByIdAndDepartmentId(eceResource.getId(), cseDept.getId());
        assertThat(crossDept).isEmpty();
    }

    @Test
    @DisplayName("FacultyRepository and FacultyReviewRepository should enforce department isolation through Faculty")
    void testFacultyAndReviewRepositoryIsolation() {
        List<Faculty> cseList = facultyRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseList).extracting(Faculty::getName).contains("Dr. CSE Prof").doesNotContain("Dr. ECE Prof");

        Optional<Faculty> crossFaculty = facultyRepository.findByIdAndDepartmentId(eceFaculty.getId(), cseDept.getId());
        assertThat(crossFaculty).isEmpty();

        List<FacultyReview> cseReviews = facultyReviewRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseReviews).extracting(FacultyReview::getComment).contains("Great teacher").doesNotContain("Good lab guidance");

        Optional<FacultyReview> crossReview = facultyReviewRepository.findByIdAndDepartmentId(eceReview.getId(), cseDept.getId());
        assertThat(crossReview).isEmpty();
    }

    @Test
    @DisplayName("StudyGroupRepository and AcademicRequestRepository should enforce department scoping")
    void testStudyGroupAndRequestRepositoryIsolation() {
        List<StudyGroup> cseGroups = studyGroupRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseGroups).extracting(StudyGroup::getName).contains("CSE AI Group").doesNotContain("ECE Signals Group");

        Optional<StudyGroup> crossGroup = studyGroupRepository.findByIdAndDepartmentId(eceGroup.getId(), cseDept.getId());
        assertThat(crossGroup).isEmpty();

        List<AcademicRequest> cseReqs = requestRepository.findAllByDepartmentId(cseDept.getId());
        assertThat(cseReqs).extracting(AcademicRequest::getTitle).contains("Need DBMS PYQ").doesNotContain("Need DSP Manual");

        Optional<AcademicRequest> crossReq = requestRepository.findByIdAndDepartmentId(eceRequest.getId(), cseDept.getId());
        assertThat(crossReq).isEmpty();
    }

    @Test
    @DisplayName("AcademicEventRepository should return College events + user's department events and reject other department events")
    void testAcademicEventRepositoryIsolation() {
        List<AcademicEvent> cseEvents = eventRepository.findAllCollegeEventsOrDepartmentEvents(cseDept.getId());
        assertThat(cseEvents).extracting(AcademicEvent::getTitle)
                .contains("Annual Fest", "CSE Hackathon")
                .doesNotContain("ECE Robotics Expo");

        Optional<AcademicEvent> crossEvent = eventRepository.findByIdAndAccessibleToDepartment(eceEvent.getId(), cseDept.getId());
        assertThat(crossEvent).isEmpty();

        Optional<AcademicEvent> collegeAccess = eventRepository.findByIdAndAccessibleToDepartment(collegeEvent.getId(), cseDept.getId());
        assertThat(collegeAccess).isPresent();
    }

    @Test
    @DisplayName("WikiArticleRepository should remain globally accessible")
    void testWikiArticleGlobalAccess() {
        List<WikiArticle> articles = wikiRepository.findAll();
        assertThat(articles).extracting(WikiArticle::getSlug).contains("repo-campus-guide");

        Optional<WikiArticle> article = wikiRepository.findBySlug("repo-campus-guide");
        assertThat(article).isPresent();
    }
}
