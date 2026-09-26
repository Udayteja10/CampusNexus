package com.campusnexus.config;

import com.campusnexus.entity.campuslife.Club;
import com.campusnexus.entity.campuslife.ClubCategory;
import com.campusnexus.repository.campuslife.ClubRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClubDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ClubDataInitializer.class);
    private final ClubRepository clubRepository;

    public ClubDataInitializer(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (clubRepository.count() == 0) {
            log.info("No campus clubs found in database. Initializing official CampusNexus clubs...");
            List<Club> defaultClubs = List.of(
                    new Club("Sports Club", "sports-club", "The college-wide athletic council driving intramural leagues, varsity selections, physical fitness bootcamps, and inter-collegiate tournaments.", ClubCategory.SPORTS, "/images/clubs/sports.png", "/images/clubs/sports-cover.png", "sports@mlrit.ac.in", "{\"instagram\": \"https://instagram.com/sports_mlrit\"}"),
                    new Club("CAME - Cultural Club", "came", "The premier college-wide creative arts, digital media, photography, and theatrical performances society open to all students across campus.", ClubCategory.CULTURAL, "/images/clubs/cultural.png", "/images/clubs/cultural-cover.png", "came@mlrit.ac.in", "{\"instagram\": \"https://instagram.com/came_mlrit\"}"),
                    new Club("EWB - Engineers Without Borders", "ewb", "Student-driven community engineering initiatives focusing on clean water, renewable energy, and sustainable village development.", ClubCategory.SOCIAL, "/images/clubs/ewb.png", "/images/clubs/ewb-cover.png", "ewb@mlrit.ac.in", "{\"linkedin\": \"https://linkedin.com/company/ewb-mlrit\"}"),
                    new Club("Apex - Robotics & Automation", "apex", "The premier student robotics and automated systems community designing autonomous bots, drones, and IoT hardware.", ClubCategory.TECHNICAL, "/images/clubs/robotics.png", "/images/clubs/robotics-cover.png", "apex@mlrit.ac.in", "{\"linkedin\": \"https://linkedin.com/company/apex-mlrit\"}"),
                    new Club("SCOPE - Coding Club", "scope", "Dedicated to competitive coding, algorithmic problem solving, Google Summer of Code mentorship, and system design.", ClubCategory.TECHNICAL, "/images/clubs/coding.png", "/images/clubs/coding-cover.png", "scope@mlrit.ac.in", "{\"github\": \"https://github.com/mlrit\"}"),
                    new Club("NSS - National Service Scheme", "nss", "The official institutional community outreach, disaster relief preparedness, social awareness, and civic volunteering wing.", ClubCategory.SOCIAL, "/images/clubs/nss.png", "/images/clubs/nss-cover.png", "nss@mlrit.ac.in", "{\"instagram\": \"https://instagram.com/nss_mlrit\"}"),
                    new Club("CIE - Innovation & Entrepreneurship", "cie", "The startup incubator, venture accelerator, and investor pitching cell empowering campus innovators and founders.", ClubCategory.ACADEMIC, "/images/clubs/cie.png", "/images/clubs/cie-cover.png", "cie@mlrit.ac.in", "{\"linkedin\": \"https://linkedin.com/company/cie-mlrit\"}"),
                    new Club("Club Literati & Debating Society", "club-literati", "The intellectual home for parliamentary debate, elocution, creative writing, poetry slams, and Model United Nations delegations.", ClubCategory.LITERARY, "/images/clubs/literary.png", "/images/clubs/literary-cover.png", "literati@mlrit.ac.in", "{\"twitter\": \"https://twitter.com/literati_mlrit\"}"),
                    new Club("CSI - Computer Society of India", "csi", "The premier technical society organizing national symposiums, hackathons, cloud certifications, and tech workshops.", ClubCategory.TECHNICAL, "/images/clubs/csi.png", "/images/clubs/csi-cover.png", "csi@mlrit.ac.in", "{\"linkedin\": \"https://linkedin.com/company/csi-mlrit\"}")
            );
            clubRepository.saveAll(defaultClubs);
            log.info("Successfully initialized {} official CampusNexus clubs.", defaultClubs.size());
        }
    }
}
