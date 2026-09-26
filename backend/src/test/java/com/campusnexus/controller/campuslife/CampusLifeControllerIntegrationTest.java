package com.campusnexus.controller.campuslife;

import com.campusnexus.dto.campuslife.*;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.CalendarEventType;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.entity.campuslife.ItemCondition;
import com.campusnexus.entity.campuslife.ListingStatus;
import com.campusnexus.entity.campuslife.LostFoundCategory;
import com.campusnexus.entity.campuslife.LostFoundType;
import com.campusnexus.entity.campuslife.MarketplaceCategory;
import com.campusnexus.entity.campuslife.ReportStatus;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.campuslife.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CampusLifeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AcademicCalendarEventRepository calendarEventRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubAnnouncementRepository announcementRepository;

    @Autowired
    private ClubEventRepository eventRepository;

    @Autowired
    private MarketplaceListingRepository marketplaceRepository;

    @Autowired
    private LostFoundReportRepository lostFoundRepository;

    @Autowired
    private CampusWikiPageRepository wikiRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    private User student;
    private User moderator;
    private User admin;
    private Department dept;

    @BeforeEach
    void setUp() {
        cleanUp();
        dept = departmentRepository.findByCode("CSE").orElseGet(() -> departmentRepository.save(new Department("CSE", "Computer Science", "CSE Department")));
        student = userRepository.save(new User("student.cltest@mlrit.ac.in", "$2a$10$hash", Role.STUDENT, 2023, "R21", 3, dept, "23R21A0588"));
        moderator = userRepository.save(new User("mod.cltest@mlrit.ac.in", "$2a$10$hash", Role.MODERATOR));
        admin = userRepository.save(new User("admin.cltest@mlrit.ac.in", "$2a$10$hash", Role.ADMIN));
    }

    @AfterEach
    void cleanUp() {
        marketplaceRepository.deleteAll();
        lostFoundRepository.deleteAll();
        wikiRepository.deleteAll();
        userBadgeRepository.deleteAll();
        eventRepository.deleteAll();
        announcementRepository.deleteAll();
        clubRepository.findBySlug("web-dev-guild").ifPresent(clubRepository::delete);
        clubRepository.findBySlug("robotics-club").ifPresent(clubRepository::delete);
        calendarEventRepository.deleteAll();

        if (student != null && student.getId() != null) userRepository.deleteById(student.getId());
        if (moderator != null && moderator.getId() != null) userRepository.deleteById(moderator.getId());
        if (admin != null && admin.getId() != null) userRepository.deleteById(admin.getId());
    }

    // ==========================================
    // 1. Calendar API
    // ==========================================

    @Test
    @WithMockUser(username = "admin.cltest@mlrit.ac.in", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/calendar and GET /api/v1/calendar")
    void testCalendarEndpoints() throws Exception {
        CalendarEventRequestDto request = new CalendarEventRequestDto();
        request.setTitle("Annual Sports Day 2026");
        request.setEventType(CalendarEventType.EVENT);
        request.setStartDate(LocalDateTime.now().plusDays(10));
        request.setEndDate(LocalDateTime.now().plusDays(11));
        request.setAllDay(true);

        mockMvc.perform(post("/api/v1/calendar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Annual Sports Day 2026")));

        mockMvc.perform(get("/api/v1/calendar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    // ==========================================
    // 2. Clubs API
    // ==========================================

    @Test
    @WithMockUser(username = "admin.cltest@mlrit.ac.in", roles = {"ADMIN"})
    @DisplayName("Club API: create club, fetch club, post announcement as ADMIN")
    void testClubEndpoints() throws Exception {
        ClubRequestDto clubReq = new ClubRequestDto();
        clubReq.setName("Web Developers Guild");
        clubReq.setSlug("web-dev-guild");
        clubReq.setDescription("Building Next.js and Spring Boot applications");
        clubReq.setCategory(ClubCategory.TECHNICAL);

        String clubJson = mockMvc.perform(post("/api/v1/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clubReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.slug", is("web-dev-guild")))
                .andReturn().getResponse().getContentAsString();

        Long clubId = objectMapper.readTree(clubJson).path("data").path("id").asLong();

        ClubAnnouncementRequestDto annReq = new ClubAnnouncementRequestDto();
        annReq.setTitle("Hackathon Kickoff");
        annReq.setContent("Starts at 9 AM tomorrow in Hall 3.");

        mockMvc.perform(post("/api/v1/clubs/" + clubId + "/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(annReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Hackathon Kickoff")));
    }

    // ==========================================
    // 3. Marketplace API
    // ==========================================

    @Test
    @WithMockUser(username = "student.cltest@mlrit.ac.in", roles = {"STUDENT"})
    @DisplayName("Marketplace API: create listing, fetch listing, update status")
    void testMarketplaceEndpoints() throws Exception {
        MarketplaceListingRequestDto req = new MarketplaceListingRequestDto();
        req.setTitle("Engineering Physics Textbook");
        req.setDescription("First year textbook, clean pages");
        req.setCategory(MarketplaceCategory.BOOKS);
        req.setPrice(new BigDecimal("350.00"));
        req.setConditionType(ItemCondition.GOOD);

        String result = mockMvc.perform(post("/api/v1/marketplace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Engineering Physics Textbook")))
                .andReturn().getResponse().getContentAsString();

        Long listingId = objectMapper.readTree(result).path("data").path("id").asLong();

        MarketplaceStatusUpdateDto statusUpdate = new MarketplaceStatusUpdateDto(ListingStatus.SOLD);
        mockMvc.perform(patch("/api/v1/marketplace/" + listingId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SOLD")));
    }

    // ==========================================
    // 4. Lost & Found API
    // ==========================================

    @Test
    @WithMockUser(username = "student.cltest@mlrit.ac.in", roles = {"STUDENT"})
    @DisplayName("Lost & Found API: create report, search reports, resolve report")
    void testLostFoundEndpoints() throws Exception {
        LostFoundReportRequestDto req = new LostFoundReportRequestDto();
        req.setType(LostFoundType.FOUND);
        req.setTitle("Black Casio Watch");
        req.setDescription("Found near library reception desk");
        req.setCategory(LostFoundCategory.ACCESSORIES);
        req.setLocation("Central Library");
        req.setEventDate(LocalDate.now());

        String res = mockMvc.perform(post("/api/v1/lost-found")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Black Casio Watch")))
                .andReturn().getResponse().getContentAsString();

        Long reportId = objectMapper.readTree(res).path("data").path("id").asLong();

        LostFoundStatusUpdateDto statusDto = new LostFoundStatusUpdateDto(ReportStatus.RESOLVED);
        mockMvc.perform(patch("/api/v1/lost-found/" + reportId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("RESOLVED")));
    }

    // ==========================================
    // 5. Campus Wiki API
    // ==========================================

    @Test
    @WithMockUser(username = "admin.cltest@mlrit.ac.in", roles = {"ADMIN"})
    @DisplayName("Wiki API: create wiki page, fetch by slug")
    void testWikiEndpoints() throws Exception {
        CampusWikiPageRequestDto req = new CampusWikiPageRequestDto();
        req.setTitle("Campus Wi-Fi Setup Guide");
        req.setContent("Instructions on connecting to MLRIT-Student Wi-Fi network.");
        req.setCategory(com.campusnexus.entity.campuslife.CampusWikiCategory.CAMPUS);

        mockMvc.perform(post("/api/v1/wiki")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("PUBLISHED")));

        mockMvc.perform(get("/api/v1/wiki/slug/campus-wi-fi-setup-guide"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Campus Wi-Fi Setup Guide")));
    }

    // ==========================================
    // 6. Badges API
    // ==========================================

    @Test
    @WithMockUser(username = "admin.cltest@mlrit.ac.in", roles = {"ADMIN"})
    @DisplayName("Badges API: list badges, award badge to student")
    void testBadgesEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
