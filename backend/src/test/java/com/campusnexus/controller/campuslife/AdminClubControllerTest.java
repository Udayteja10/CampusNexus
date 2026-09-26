package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.campuslife.AssignClubPresidentRequestDto;
import com.campusnexus.dto.campuslife.ClubAchievementRequestDto;
import com.campusnexus.dto.campuslife.ClubAnnouncementRequestDto;
import com.campusnexus.dto.campuslife.ClubEventRequestDto;
import com.campusnexus.dto.campuslife.ClubGalleryItemRequestDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.UpdateClubStatusRequestDto;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.campuslife.ClubRepository;
import com.campusnexus.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminClubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User adminUser;
    private User modUser;
    private User studentUser1;
    private User studentUser2;

    private String adminToken;
    private String modToken;
    private String studentToken1;

    private Club sportsClub;
    private Club techClub;

    @BeforeEach
    void setUp() {
        // Create test users
        adminUser = createTestUser("admin_club_test@mlrit.ac.in", "admin_club_test", Role.ADMIN, "23R21A0001");
        modUser = createTestUser("mod_club_test@mlrit.ac.in", "mod_club_test", Role.MODERATOR, "23R21A0002");
        studentUser1 = createTestUser("student1_club_test@mlrit.ac.in", "student1_club_test", Role.STUDENT, "23R21A0003");
        studentUser2 = createTestUser("student2_club_test@mlrit.ac.in", "student2_club_test", Role.STUDENT, "23R21A0004");

        adminToken = jwtService.generateToken(adminUser);
        modToken = jwtService.generateToken(modUser);
        studentToken1 = jwtService.generateToken(studentUser1);

        // Create test clubs
        sportsClub = new Club("Test Sports Club", "test-sports-club", "Sports activities", ClubCategory.SPORTS, null, null, "sports@mlrit.ac.in", null);
        sportsClub.setStatus("ACTIVE");
        sportsClub = clubRepository.save(sportsClub);

        techClub = new Club("Test Tech Club", "test-tech-club", "Tech activities", ClubCategory.TECHNICAL, null, null, "tech@mlrit.ac.in", null);
        techClub.setStatus("ACTIVE");
        techClub = clubRepository.save(techClub);
    }

    private User createTestUser(String email, String username, Role role, String htno) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setUsername(username);
            u.setFullName("Test " + username);
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setRole(role);
            u.setHtno(htno);
            u.setEnabled(true);
            u.setEmailVerified(true);
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("1. ADMIN can list all clubs")
    void testAdminCanListClubs() throws Exception {
        mockMvc.perform(get("/api/v1/admin/clubs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("2. ADMIN can create a club")
    void testAdminCanCreateClub() throws Exception {
        ClubRequestDto request = new ClubRequestDto();
        request.setName("New Robotics Club");
        request.setSlug("new-robotics-club");
        request.setCategory(ClubCategory.TECHNICAL);
        request.setDescription("Robotics and drones");
        request.setContactEmail("robotics@mlrit.ac.in");

        mockMvc.perform(post("/api/v1/admin/clubs")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Robotics Club"))
                .andExpect(jsonPath("$.data.slug").value("new-robotics-club"));
    }

    @Test
    @DisplayName("3. ADMIN can edit a club")
    void testAdminCanEditClub() throws Exception {
        ClubRequestDto update = new ClubRequestDto();
        update.setName("Updated Sports Arena");
        update.setSlug("test-sports-club");
        update.setCategory(ClubCategory.SPORTS);
        update.setDescription("Updated description");
        update.setContactEmail("updated.sports@mlrit.ac.in");

        mockMvc.perform(put("/api/v1/admin/clubs/" + sportsClub.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Sports Arena"))
                .andExpect(jsonPath("$.data.contactEmail").value("updated.sports@mlrit.ac.in"));
    }

    @Test
    @DisplayName("4. ADMIN can deactivate and restore a club")
    void testAdminCanDeactivateAndRestoreClub() throws Exception {
        // Deactivate
        UpdateClubStatusRequestDto deactReq = new UpdateClubStatusRequestDto("INACTIVE");
        mockMvc.perform(patch("/api/v1/admin/clubs/" + sportsClub.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));

        // Restore
        UpdateClubStatusRequestDto restoreReq = new UpdateClubStatusRequestDto("ACTIVE");
        mockMvc.perform(patch("/api/v1/admin/clubs/" + sportsClub.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoreReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("5. ADMIN can assign, replace, and remove club president")
    void testAdminPresidentManagementFlow() throws Exception {
        // Assign student 1
        AssignClubPresidentRequestDto assignReq1 = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(studentUser1.getId()))
                .andExpect(jsonPath("$.data.active").value(true));

        // Get president
        mockMvc.perform(get("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(studentUser1.getUsername()));

        // Replace with student 2
        AssignClubPresidentRequestDto assignReq2 = new AssignClubPresidentRequestDto(studentUser2.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(studentUser2.getId()));

        // Remove president
        mockMvc.perform(delete("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Verify no active president
        mockMvc.perform(get("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("6. STUDENT and MODERATOR cannot access admin club management endpoints")
    void testNonAdminForbiddenFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/clubs")
                        .header("Authorization", "Bearer " + studentToken1))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/clubs")
                        .header("Authorization", "Bearer " + modToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/clubs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("7. Normal STUDENT cannot create announcements, events, gallery, or achievements")
    void testNormalStudentCannotManageClubContent() throws Exception {
        ClubAnnouncementRequestDto annReq = new ClubAnnouncementRequestDto("Unauthorized", "Should fail");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isForbidden());

        ClubEventRequestDto evtReq = new ClubEventRequestDto(
                "Unauthorized Event", "Desc", "Venue",
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(2),
                null, null
        );
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/events")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evtReq)))
                .andExpect(status().isForbidden());

        ClubGalleryItemRequestDto galReq = new ClubGalleryItemRequestDto("https://example.com/photo.png", "Caption");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/gallery")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(galReq)))
                .andExpect(status().isForbidden());

        ClubAchievementRequestDto achReq = new ClubAchievementRequestDto("Trophy", "Won gold", LocalDate.now(), null);
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/achievements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(achReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Assigned Club President CAN manage their club content, but NOT other clubs")
    void testClubPresidentCanManageOwnClubOnly() throws Exception {
        // Assign student1 as President of sportsClub
        AssignClubPresidentRequestDto assignReq = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // student1 posts announcement to sportsClub -> SUCCESS
        ClubAnnouncementRequestDto annReq = new ClubAnnouncementRequestDto("Official Tryouts", "Tryouts on Monday");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Official Tryouts"));

        // student1 attempts to post announcement to techClub -> FORBIDDEN (403)
        mockMvc.perform(post("/api/v1/clubs/" + techClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9. Removed President immediately loses management permissions")
    void testRemovedPresidentLosesPermissions() throws Exception {
        // Assign student1 as President of sportsClub
        AssignClubPresidentRequestDto assignReq = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // Verify student1 has access
        ClubAnnouncementRequestDto annReq = new ClubAnnouncementRequestDto("Before Removal", "Content");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isCreated());

        // Remove student1
        mockMvc.perform(delete("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // student1 attempts to post again -> FORBIDDEN (403)
        ClubAnnouncementRequestDto annReq2 = new ClubAnnouncementRequestDto("After Removal", "Content");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq2)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Deactivated club rejects content submissions even from President")
    void testDeactivatedClubRejectsSubmissions() throws Exception {
        // Assign student1 as President of sportsClub
        AssignClubPresidentRequestDto assignReq = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // Deactivate sportsClub
        UpdateClubStatusRequestDto deactReq = new UpdateClubStatusRequestDto("INACTIVE");
        mockMvc.perform(patch("/api/v1/admin/clubs/" + sportsClub.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactReq)))
                .andExpect(status().isOk());

        // student1 tries to post announcement -> FORBIDDEN (403)
        ClubAnnouncementRequestDto annReq = new ClubAnnouncementRequestDto("Inactive Post", "Content");
        mockMvc.perform(post("/api/v1/clubs/" + sportsClub.getId() + "/announcements")
                        .header("Authorization", "Bearer " + studentToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. Student already president of Club A CANNOT be assigned as president of Club B")
    void testStudentCannotBePresidentOfMultipleClubs() throws Exception {
        // Assign student1 as President of sportsClub
        AssignClubPresidentRequestDto assignSports = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignSports)))
                .andExpect(status().isOk());

        // Attempt to assign student1 as President of techClub -> BAD REQUEST (400)
        AssignClubPresidentRequestDto assignTech = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + techClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignTech)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already president of another club")));
    }

    @Test
    @DisplayName("12. President candidates endpoint excludes active presidents and returns eligible students")
    void testPresidentCandidatesSearch() throws Exception {
        // Assign student1 as President of sportsClub
        AssignClubPresidentRequestDto assignSports = new AssignClubPresidentRequestDto(studentUser1.getId(), "PRESIDENT");
        mockMvc.perform(post("/api/v1/admin/clubs/" + sportsClub.getId() + "/president")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignSports)))
                .andExpect(status().isOk());

        // Fetch candidates -> should contain student2, but NOT student1
        mockMvc.perform(get("/api/v1/admin/clubs/president-candidates")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(studentUser1.getId().intValue()))))
                .andExpect(jsonPath("$.data[*].id", hasItem(studentUser2.getId().intValue())));
    }
}
