package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.*;
import com.campusnexus.entity.Department;
import com.campusnexus.entity.Role;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.*;
import com.campusnexus.repository.DepartmentRepository;
import com.campusnexus.repository.UserRepository;
import com.campusnexus.repository.campuslife.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class CampusLifeModulesTest {

    @Autowired
    private AcademicCalendarService calendarService;

    @Autowired
    private ClubService clubService;

    @Autowired
    private MarketplaceService marketplaceService;

    @Autowired
    private LostFoundService lostFoundService;

    @Autowired
    private CampusWikiService wikiService;

    @Autowired
    private BadgeService badgeService;

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
    private ClubGalleryItemRepository galleryItemRepository;

    @Autowired
    private ClubAchievementRepository achievementRepository;

    @Autowired
    private MarketplaceListingRepository marketplaceRepository;

    @Autowired
    private LostFoundReportRepository lostFoundRepository;

    @Autowired
    private CampusWikiPageRepository wikiRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    private User studentCse;
    private User studentEce;
    private User moderator;
    private User admin;
    private Department cseDept;
    private Department eceDept;

    @BeforeEach
    void setUp() {
        cleanUp();

        cseDept = departmentRepository.findByCode("CSE").orElseGet(() -> departmentRepository.save(new Department("CSE", "Computer Science", "CSE Department")));
        eceDept = departmentRepository.findByCode("ECE").orElseGet(() -> departmentRepository.save(new Department("ECE", "Electronics", "ECE Department")));

        studentCse = userRepository.save(new User("student.cse@mlrit.ac.in", "$2a$10$hash", Role.STUDENT, 2023, "R21", 3, cseDept, "23R21A0599"));
        studentEce = userRepository.save(new User("student.ece@mlrit.ac.in", "$2a$10$hash", Role.STUDENT, 2023, "R21", 2, eceDept, "23R21A0499"));
        moderator = userRepository.save(new User("mod.test@mlrit.ac.in", "$2a$10$hash", Role.MODERATOR));
        admin = userRepository.save(new User("admin.test@mlrit.ac.in", "$2a$10$hash", Role.ADMIN));
    }

    @AfterEach
    void cleanUp() {
        marketplaceRepository.deleteAll();
        lostFoundRepository.deleteAll();
        wikiRepository.deleteAll();
        userBadgeRepository.deleteAll();
        announcementRepository.deleteAll();
        eventRepository.deleteAll();
        galleryItemRepository.deleteAll();
        achievementRepository.deleteAll();
        clubRepository.findBySlug("acm-mlrit").ifPresent(clubRepository::delete);
        clubRepository.findBySlug("test-robotics-club").ifPresent(clubRepository::delete);
        calendarEventRepository.deleteAll();

        if (studentCse != null && studentCse.getId() != null) userRepository.deleteById(studentCse.getId());
        if (studentEce != null && studentEce.getId() != null) userRepository.deleteById(studentEce.getId());
        if (moderator != null && moderator.getId() != null) userRepository.deleteById(moderator.getId());
        if (admin != null && admin.getId() != null) userRepository.deleteById(admin.getId());
    }

    // =========================================================================
    // 1. Academic Calendar Tests
    // =========================================================================

    @Test
    @DisplayName("Admin creates global & department calendar events; student sees only relevant ones")
    void testCalendarVisibilityAndIsolation() {
        CalendarEventRequestDto globalDto = new CalendarEventRequestDto();
        globalDto.setTitle("Mid-Term Examinations");
        globalDto.setEventType(CalendarEventType.EXAM);
        globalDto.setStartDate(LocalDateTime.now().plusDays(5));
        globalDto.setEndDate(LocalDateTime.now().plusDays(10));
        globalDto.setAllDay(true);

        CalendarEventResponseDto globalEvent = calendarService.createEvent(globalDto, admin);
        assertThat(globalEvent.getId()).isNotNull();

        CalendarEventRequestDto cseDto = new CalendarEventRequestDto();
        cseDto.setTitle("CSE Tech Fest");
        cseDto.setEventType(CalendarEventType.EVENT);
        cseDto.setStartDate(LocalDateTime.now().plusDays(2));
        cseDto.setEndDate(LocalDateTime.now().plusDays(3));
        cseDto.setDepartmentId(cseDept.getId());

        CalendarEventResponseDto cseEvent = calendarService.createEvent(cseDto, admin);
        assertThat(cseEvent.getId()).isNotNull();

        // Student from CSE should see globalEvent and cseEvent
        List<CalendarEventResponseDto> cseEvents = calendarService.getEvents(studentCse, null, null, null);
        assertThat(cseEvents).extracting(CalendarEventResponseDto::getTitle)
                .contains("Mid-Term Examinations", "CSE Tech Fest");

        // Student from ECE should see globalEvent but NOT cseEvent
        List<CalendarEventResponseDto> eceEvents = calendarService.getEvents(studentEce, null, null, null);
        assertThat(eceEvents).extracting(CalendarEventResponseDto::getTitle)
                .contains("Mid-Term Examinations")
                .doesNotContain("CSE Tech Fest");

        // Student attempts to create event -> AccessDeniedException
        assertThatThrownBy(() -> calendarService.createEvent(globalDto, studentCse))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================================
    // 2. Clubs & Events Tests
    // =========================================================================

    @Test
    @DisplayName("Admin creates club, announcements, events; non-authorized users rejected")
    void testClubsFlow() {
        ClubRequestDto clubDto = new ClubRequestDto();
        clubDto.setName("ACM Student Chapter");
        clubDto.setSlug("acm-mlrit");
        clubDto.setDescription("Association for Computing Machinery");
        clubDto.setCategory(ClubCategory.TECHNICAL);

        // Student and Moderator cannot create clubs
        assertThatThrownBy(() -> clubService.createClub(clubDto, studentCse))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> clubService.createClub(clubDto, moderator))
                .isInstanceOf(AccessDeniedException.class);

        ClubResponseDto club = clubService.createClub(clubDto, admin);
        assertThat(club.getId()).isNotNull();

        // Add announcement by admin
        ClubAnnouncementRequestDto annDto = new ClubAnnouncementRequestDto();
        annDto.setTitle("Welcome new batch");
        annDto.setContent("Orientation session on Friday!");
        ClubAnnouncementResponseDto ann = clubService.createAnnouncement(club.getId(), annDto, admin);
        assertThat(ann.getId()).isNotNull();

        List<ClubAnnouncementResponseDto> announcements = clubService.getAnnouncements(club.getId());
        assertThat(announcements).hasSize(1);
        assertThat(announcements.get(0).getTitle()).isEqualTo("Welcome new batch");

        // Add event by admin
        ClubEventRequestDto eventDto = new ClubEventRequestDto();
        eventDto.setTitle("Hackathon 2026");
        eventDto.setVenue("Auditorium B");
        eventDto.setStartDateTime(LocalDateTime.now().plusDays(7));
        eventDto.setEndDateTime(LocalDateTime.now().plusDays(8));
        ClubEventResponseDto event = clubService.createEvent(club.getId(), eventDto, admin);
        assertThat(event.getId()).isNotNull();

        List<ClubEventResponseDto> events = clubService.getEvents(club.getId());
        assertThat(events).hasSize(1);
    }

    // =========================================================================
    // 3. Marketplace Tests & Ownership Enforcement
    // =========================================================================

    @Test
    @DisplayName("Marketplace: Seller can update listing, other student rejected with 403")
    void testMarketplaceOwnership() {
        MarketplaceListingRequestDto createDto = new MarketplaceListingRequestDto();
        createDto.setTitle("Casio FX-991EX Calculator");
        createDto.setDescription("Scientific calculator in good condition");
        createDto.setCategory(MarketplaceCategory.CALCULATORS);
        createDto.setPrice(new BigDecimal("750.00"));
        createDto.setConditionType(ItemCondition.LIKE_NEW);

        MarketplaceListingResponseDto listing = marketplaceService.createListing(createDto, studentCse);
        assertThat(listing.getId()).isNotNull();
        assertThat(listing.getStatus()).isEqualTo(ListingStatus.ACTIVE);

        // Seller updates their own listing -> OK
        createDto.setPrice(new BigDecimal("700.00"));
        MarketplaceListingResponseDto updated = marketplaceService.updateListing(listing.getId(), createDto, studentCse);
        assertThat(updated.getPrice()).isEqualByComparingTo(new BigDecimal("700.00"));

        // Student ECE attempts to update Student CSE's listing -> AccessDeniedException (403)
        createDto.setPrice(new BigDecimal("100.00"));
        assertThatThrownBy(() -> marketplaceService.updateListing(listing.getId(), createDto, studentEce))
                .isInstanceOf(AccessDeniedException.class);

        // Student CSE marks listing as SOLD -> OK
        MarketplaceListingResponseDto sold = marketplaceService.updateStatus(listing.getId(), ListingStatus.SOLD, studentCse);
        assertThat(sold.getStatus()).isEqualTo(ListingStatus.SOLD);

        // Student ECE attempts to delete Student CSE's listing -> AccessDeniedException (403)
        assertThatThrownBy(() -> marketplaceService.deleteListing(listing.getId(), studentEce))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================================
    // 4. Lost & Found Tests & Ownership Enforcement
    // =========================================================================

    @Test
    @DisplayName("Lost & Found: Reporter can update report, other student cannot")
    void testLostFoundOwnership() {
        LostFoundReportRequestDto reportDto = new LostFoundReportRequestDto();
        reportDto.setType(LostFoundType.LOST);
        reportDto.setTitle("Blue Water Bottle");
        reportDto.setDescription("Milton insulated water bottle left in Room 204");
        reportDto.setCategory(LostFoundCategory.OTHER);
        reportDto.setLocation("Room 204, CSE Block");
        reportDto.setEventDate(LocalDate.now());

        LostFoundReportResponseDto report = lostFoundService.createReport(reportDto, studentCse);
        assertThat(report.getId()).isNotNull();
        assertThat(report.getStatus()).isEqualTo(ReportStatus.OPEN);

        // Reporter marks report RESOLVED -> OK
        LostFoundReportResponseDto resolved = lostFoundService.updateStatus(report.getId(), ReportStatus.RESOLVED, studentCse);
        assertThat(resolved.getStatus()).isEqualTo(ReportStatus.RESOLVED);

        // Other student tries to change status -> AccessDeniedException
        assertThatThrownBy(() -> lostFoundService.updateStatus(report.getId(), ReportStatus.CLOSED, studentEce))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================================
    // 5. Campus Wiki Tests & Moderation Workflow
    // =========================================================================

    @Test
    @DisplayName("Campus Wiki: Student submission creates PENDING_REVIEW; Moderator publishes it")
    void testWikiModerationWorkflow() {
        CampusWikiPageRequestDto wikiDto = new CampusWikiPageRequestDto();
        wikiDto.setTitle("Central Library Procedures");
        wikiDto.setContent("How to issue books, digital library access, and timings.");
        wikiDto.setCategory(CampusWikiCategory.FACILITIES);

        // Student creates wiki page -> PENDING_REVIEW
        CampusWikiPageResponseDto submitted = wikiService.createPage(wikiDto, studentCse);
        assertThat(submitted.getId()).isNotNull();
        assertThat(submitted.getStatus()).isEqualTo(WikiStatus.PENDING_REVIEW);

        // Student ECE cannot see it in search yet (student search returns PUBLISHED only)
        List<CampusWikiPageResponseDto> searchResults = wikiService.searchPages(null, null, null, studentEce);
        assertThat(searchResults).extracting(CampusWikiPageResponseDto::getTitle)
                .doesNotContain("Central Library Procedures");

        // Moderator reviews and publishes
        WikiModerationDto moderationDto = new WikiModerationDto(WikiStatus.PUBLISHED, null);
        CampusWikiPageResponseDto published = wikiService.moderatePage(submitted.getId(), moderationDto, moderator);
        assertThat(published.getStatus()).isEqualTo(WikiStatus.PUBLISHED);

        // Now Student ECE can search and find it
        List<CampusWikiPageResponseDto> studentSearchAfterPublish = wikiService.searchPages(null, null, null, studentEce);
        assertThat(studentSearchAfterPublish).extracting(CampusWikiPageResponseDto::getTitle)
                .contains("Central Library Procedures");
    }

    // =========================================================================
    // 6. Achievement Badges Tests
    // =========================================================================

    @Test
    @DisplayName("Badges: Staff can award badges, students cannot self-award")
    void testBadgeSystem() {
        Badge badge = badgeRepository.findByName("TEST_CONTRIBUTOR")
                .orElseGet(() -> badgeRepository.save(new Badge("TEST_CONTRIBUTOR", "Active peer helper", "Award", "Help 3 students")));

        // Student attempts to award badge to themselves -> AccessDeniedException (403)
        assertThatThrownBy(() -> badgeService.awardBadge(studentCse.getId(), badge.getId(), studentCse))
                .isInstanceOf(AccessDeniedException.class);

        // Moderator awards badge to Student CSE -> OK
        UserBadgeResponseDto awarded = badgeService.awardBadge(studentCse.getId(), badge.getId(), moderator);
        assertThat(awarded.getId()).isNotNull();
        assertThat(awarded.getBadgeName()).isEqualTo("TEST_CONTRIBUTOR");

        // Student CSE views their badges
        List<UserBadgeResponseDto> myBadges = badgeService.getMyBadges(studentCse);
        assertThat(myBadges).hasSize(1);
        assertThat(myBadges.get(0).getBadgeName()).isEqualTo("TEST_CONTRIBUTOR");

        // Attempt duplicate award -> IllegalArgumentException
        assertThatThrownBy(() -> badgeService.awardBadge(studentCse.getId(), badge.getId(), admin))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
