package com.campusnexus.service.campuslife;

import com.campusnexus.dto.campuslife.AssignClubPresidentRequestDto;
import com.campusnexus.dto.campuslife.ClubPresidentDto;
import com.campusnexus.dto.campuslife.ClubRequestDto;
import com.campusnexus.dto.campuslife.ClubResponseDto;
import com.campusnexus.entity.User;
import com.campusnexus.entity.campuslife.ClubCategory;

import java.util.List;

public interface AdminClubService {

    List<ClubResponseDto> getAllClubsForAdmin(ClubCategory category, String status, String keyword);

    ClubResponseDto getClubByIdForAdmin(Long id);

    ClubResponseDto createClub(ClubRequestDto dto, User adminUser);

    ClubResponseDto updateClub(Long id, ClubRequestDto dto, User adminUser);

    ClubResponseDto updateClubStatus(Long id, String status, User adminUser);

    void deleteClub(Long id, User adminUser);

    ClubPresidentDto getClubPresident(Long clubId);

    List<ClubPresidentDto> getClubPresidentHistory(Long clubId);

    ClubPresidentDto assignClubPresident(Long clubId, AssignClubPresidentRequestDto dto, User adminUser);

    void removeClubPresident(Long clubId, User adminUser);

    List<com.campusnexus.dto.campuslife.PresidentCandidateDto> getPresidentCandidates(String search);
}
