package com.campusnexus.controller;

import com.campusnexus.dto.academic.AcademicResourceDto;
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
import com.campusnexus.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AcademicIsolationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private static final String CSE_STUDENT_EMAIL = "ctrl.cse.student@campusnexus.com";
    private static final String ECE_STUDENT_EMAIL = "ctrl.ece.student@campusnexus.com";
    private static final String MODERATOR_EMAIL = "ctrl.mod@campusnexus.com";
    private static final String ADMIN_EMAIL = "ctrl.admin@campusnexus.com";
    private static final String NO_DEPT_EMAIL = "ctrl.nodept@campusnexus.com";

    private Department cseDept;
    private Department eceDept;

    private User cseStudent;
    private User eceStudent;
    private User moderator;
    private User admin;
    private User noDeptStudent;

    private String cseToken;
    private String modToken;
    private String adminToken;
    private String noDeptToken;

    private Subject eceSubject;
    private AcademicResource cseResource;
    private AcademicResource eceResource;
    private Faculty eceFaculty;
    private StudyGroup eceGroup;
    private AcademicRequest eceRequest;
    private AcademicEvent eceEvent;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseThrow();
        eceDept = departmentRepository.findByCode("ECE").orElseThrow();

        cseStudent = userRepository.save(new User(CSE_STUDENT_EMAIL, passwordEncoder.encode("Password@123"), Role.STUDENT, 2023, "R21", 4, cseDept, "23R21A0281"));
        eceStudent = userRepository.save(new User(ECE_STUDENT_EMAIL, passwordEncoder.encode("Password@123"), Role.STUDENT, 2023, "R21", 4, eceDept, "23R21A0481"));
        moderator = userRepository.save(new User(MODERATOR_EMAIL, passwordEncoder.encode("Password@123"), Role.MODERATOR));
        admin = userRepository.save(new User(ADMIN_EMAIL, passwordEncoder.encode("Password@123"), Role.ADMIN));
        noDeptStudent = userRepository.save(new User(NO_DEPT_EMAIL, passwordEncoder.encode("Password@123"), Role.STUDENT));

        cseToken = jwtService.generateToken(cseStudent);
        jwtService.generateToken(eceStudent);
        modToken = jwtService.generateToken(moderator);
        adminToken = jwtService.generateToken(admin);
        noDeptToken = jwtService.generateToken(noDeptStudent);

        // Domain records
        Subject cseSubject = subjectRepository.save(new Subject("CS501PC", "DBMS", cseDept, 5, 3, "Database Systems"));
        eceSubject = subjectRepository.save(new Subject("EC501PC", "DSP", eceDept, 5, 3, "Digital Signal Processing"));

        cseResource = resourceRepository.save(new AcademicResource("DBMS Notes", "Unit 1", cseDept, cseSubject, "CS501PC", "DBMS", 5, ResourceType.NOTE, "https://example.com/dbms.pdf", "pdf", 1024L, cseStudent));
        eceResource = resourceRepository.save(new AcademicResource("DSP Notes", "Unit 1", eceDept, eceSubject, "EC501PC", "DSP", 5, ResourceType.NOTE, "https://example.com/dsp.pdf", "pdf", 2048L, eceStudent));

        facultyRepository.save(new Faculty("Dr. CSE Prof", "Professor", cseDept, "cse.prof@campusnexus.com", "B-301", "2-4 PM"));
        eceFaculty = facultyRepository.save(new Faculty("Dr. ECE Prof", "Professor", eceDept, "ece.prof@campusnexus.com", "C-201", "1-3 PM"));

        studyGroupRepository.save(new StudyGroup("CSE AI Group", "AI Study", cseDept, "CS501PC", "DBMS", 5, cseStudent, 10, false, "Tue 6 PM"));
        eceGroup = studyGroupRepository.save(new StudyGroup("ECE Signals Group", "Signals Study", eceDept, "EC501PC", "DSP", 5, eceStudent, 10, false, "Wed 6 PM"));

        requestRepository.save(new AcademicRequest("Need DBMS PYQ", "2023 papers", cseDept, "CS501PC", "DBMS", 5, ResourceType.PYQ, cseStudent));
        eceRequest = requestRepository.save(new AcademicRequest("Need DSP Manual", "Lab manual", eceDept, "EC501PC", "DSP", 5, ResourceType.LAB_MANUAL, eceStudent));

        eventRepository.save(new AcademicEvent("Annual Fest", "Campus Fest", EventScope.COLLEGE, null, AcademicEventType.FEST, LocalDateTime.now(), LocalDateTime.now().plusDays(2), "Auditorium", true));
        eventRepository.save(new AcademicEvent("CSE Hackathon", "Code Fest", EventScope.DEPARTMENT, cseDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "CSE Lab", true));
        eceEvent = eventRepository.save(new AcademicEvent("ECE Expo", "Robotics", EventScope.DEPARTMENT, eceDept, AcademicEventType.WORKSHOP, LocalDateTime.now(), LocalDateTime.now().plusDays(1), "ECE Lab", false));

        wikiRepository.save(new WikiArticle("ctrl-campus-guide", "Campus Navigation", "Guide Content", WikiCategory.CAMPUS_GUIDE, null, cseStudent));
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
        userRepository.findByEmail(CSE_STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ECE_STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(MODERATOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(NO_DEPT_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Anonymous request to protected academic endpoints must return 401")
    void testAnonymousAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/academic/resources"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/academic/subjects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CSE Student list and get-by-id isolation across all academic entities")
    void testCseStudentListAndGetIsolation() throws Exception {
        // Resources
        mockMvc.perform(get("/api/v1/academic/resources")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("DBMS Notes")));

        mockMvc.perform(get("/api/v1/academic/resources/" + cseResource.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("DBMS Notes")));

        // Direct ID manipulation for ECE resource -> 403
        mockMvc.perform(get("/api/v1/academic/resources/" + eceResource.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());

        // Subjects
        mockMvc.perform(get("/api/v1/academic/subjects")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].code", is("CS501PC")));

        mockMvc.perform(get("/api/v1/academic/subjects/" + eceSubject.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());

        // Faculty
        mockMvc.perform(get("/api/v1/academic/faculty")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Dr. CSE Prof")));

        mockMvc.perform(get("/api/v1/academic/faculty/" + eceFaculty.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());

        // Study Groups
        mockMvc.perform(get("/api/v1/academic/study-groups")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("CSE AI Group")));

        mockMvc.perform(get("/api/v1/academic/study-groups/" + eceGroup.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());

        // Academic Requests
        mockMvc.perform(get("/api/v1/academic/requests")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Need DBMS PYQ")));

        mockMvc.perform(get("/api/v1/academic/requests/" + eceRequest.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());

        // Calendar
        mockMvc.perform(get("/api/v1/academic/calendar")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2))); // College + CSE event

        mockMvc.perform(get("/api/v1/academic/calendar/" + eceEvent.getId())
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Query parameter bypass attempt (?departmentId=ECE) from CSE Student must NOT return ECE data")
    void testDepartmentParameterBypassIsBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/academic/resources")
                        .param("departmentId", String.valueOf(eceDept.getId()))
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("DBMS Notes"))); // Still CSE!
    }

    @Test
    @DisplayName("Cross-department create attempt by CSE student must be rejected with 403")
    void testCrossDepartmentCreateIsBlocked() throws Exception {
        AcademicResourceDto.CreateRequest request = new AcademicResourceDto.CreateRequest();
        request.setTitle("Malicious Cross Dept Resource");
        request.setDepartmentId(eceDept.getId()); // Trying to upload to ECE as CSE student
        request.setSemester(5);
        request.setResourceType(ResourceType.NOTE);
        request.setFileUrl("https://example.com/malicious.pdf");

        mockMvc.perform(post("/api/v1/academic/resources")
                        .header("Authorization", "Bearer " + cseToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Shared Wiki is accessible to all authenticated users")
    void testSharedWikiAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/academic/wiki")
                        .header("Authorization", "Bearer " + cseToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].slug", is("ctrl-campus-guide")));

        mockMvc.perform(get("/api/v1/academic/wiki")
                        .header("Authorization", "Bearer " + noDeptToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].slug", is("ctrl-campus-guide")));
    }

    @Test
    @DisplayName("Moderator and Admin have global access across departments")
    void testModeratorAndAdminGlobalAccess() throws Exception {
        // Moderator accessing ECE resource by ID
        mockMvc.perform(get("/api/v1/academic/resources/" + eceResource.getId())
                        .header("Authorization", "Bearer " + modToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("DSP Notes")));

        // Admin accessing ECE resource by ID
        mockMvc.perform(get("/api/v1/academic/resources/" + eceResource.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("DSP Notes")));
    }

    @Test
    @DisplayName("Student with null department is rejected from department-scoped endpoints with 403")
    void testNullDepartmentStudentRejected() throws Exception {
        mockMvc.perform(get("/api/v1/academic/resources")
                        .header("Authorization", "Bearer " + noDeptToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/academic/subjects")
                        .header("Authorization", "Bearer " + noDeptToken))
                .andExpect(status().isForbidden());
    }
}
