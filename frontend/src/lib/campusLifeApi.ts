import { apiClient, ApiResponseWrapper } from './api';
import type {
  CalendarEvent,
  CalendarEventRequest,
  CalendarEventType,
  Club,
  ClubPresident,
  PresidentCandidate,
  ClubAnnouncement,
  ClubEvent,
  ClubGalleryItem,
  ClubAchievement,
  MarketplaceListing,
  MarketplaceListingRequest,
  ListingStatus,
  MarketplaceCategory,
  ItemCondition,
  LostFoundReport,
  LostFoundReportRequest,
  LostFoundType,
  LostFoundCategory,
  ReportStatus,
  CampusWikiPage,
  CampusWikiPageRequest,
  CampusWikiCategory,
  WikiStatus,
  Badge,
  UserBadge,
} from '@/types/campusLife.types';

// =============================================================================
// 1. Academic Calendar API
// =============================================================================
export const calendarApi = {
  getEvents: async (params?: {
    eventType?: CalendarEventType;
    startDate?: string;
    endDate?: string;
  }): Promise<CalendarEvent[]> => {
    const res = await apiClient.get<ApiResponseWrapper<CalendarEvent[]>>('/api/v1/calendar', { params });
    return res.data.data;
  },

  getEventById: async (id: number): Promise<CalendarEvent> => {
    const res = await apiClient.get<ApiResponseWrapper<CalendarEvent>>(`/api/v1/calendar/${id}`);
    return res.data.data;
  },

  createEvent: async (data: CalendarEventRequest): Promise<CalendarEvent> => {
    const res = await apiClient.post<ApiResponseWrapper<CalendarEvent>>('/api/v1/calendar', data);
    return res.data.data;
  },

  updateEvent: async (id: number, data: CalendarEventRequest): Promise<CalendarEvent> => {
    const res = await apiClient.put<ApiResponseWrapper<CalendarEvent>>(`/api/v1/calendar/${id}`, data);
    return res.data.data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/calendar/${id}`);
  },
};

// =============================================================================
// 2. Clubs & Events API
// =============================================================================
export interface ClubRequest {
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  coverUrl?: string;
  contactEmail?: string;
  socialLinks?: string;
  status?: string;
}

export const clubsApi = {
  getAllClubs: async (params?: {
    category?: string;
    status?: string;
    keyword?: string;
  }): Promise<Club[]> => {
    const res = await apiClient.get<ApiResponseWrapper<Club[]>>('/api/v1/clubs', { params });
    return res.data.data;
  },

  getClubById: async (id: number): Promise<Club> => {
    const res = await apiClient.get<ApiResponseWrapper<Club>>(`/api/v1/clubs/${id}`);
    return res.data.data;
  },

  getClubBySlug: async (slug: string): Promise<Club> => {
    const res = await apiClient.get<ApiResponseWrapper<Club>>(`/api/v1/clubs/slug/${slug}`);
    return res.data.data;
  },

  createClub: async (data: ClubRequest): Promise<Club> => {
    const res = await apiClient.post<ApiResponseWrapper<Club>>('/api/v1/clubs', data);
    return res.data.data;
  },

  updateClub: async (id: number, data: ClubRequest): Promise<Club> => {
    const res = await apiClient.put<ApiResponseWrapper<Club>>(`/api/v1/clubs/${id}`, data);
    return res.data.data;
  },

  deleteClub: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/clubs/${id}`);
  },

  // Announcements
  getAnnouncements: async (clubId: number): Promise<ClubAnnouncement[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubAnnouncement[]>>(`/api/v1/clubs/${clubId}/announcements`);
    return res.data.data;
  },

  createAnnouncement: async (clubId: number, data: { title: string; content: string }): Promise<ClubAnnouncement> => {
    const res = await apiClient.post<ApiResponseWrapper<ClubAnnouncement>>(`/api/v1/clubs/${clubId}/announcements`, data);
    return res.data.data;
  },

  deleteAnnouncement: async (clubId: number, announcementId: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/clubs/${clubId}/announcements/${announcementId}`);
  },

  // Events
  getEvents: async (clubId: number): Promise<ClubEvent[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubEvent[]>>(`/api/v1/clubs/${clubId}/events`);
    return res.data.data;
  },

  getAllUpcomingEvents: async (): Promise<ClubEvent[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubEvent[]>>('/api/v1/clubs/events/upcoming');
    return res.data.data;
  },

  createEvent: async (
    clubId: number,
    data: {
      title: string;
      description?: string;
      venue?: string;
      startDateTime: string;
      endDateTime: string;
      registrationLink?: string;
      imageUrl?: string;
    }
  ): Promise<ClubEvent> => {
    const res = await apiClient.post<ApiResponseWrapper<ClubEvent>>(`/api/v1/clubs/${clubId}/events`, data);
    return res.data.data;
  },

  deleteEvent: async (clubId: number, eventId: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/clubs/${clubId}/events/${eventId}`);
  },

  // Gallery
  getGallery: async (clubId: number): Promise<ClubGalleryItem[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubGalleryItem[]>>(`/api/v1/clubs/${clubId}/gallery`);
    return res.data.data;
  },

  addGalleryItem: async (
    clubId: number,
    data: { imageUrl: string; caption?: string }
  ): Promise<ClubGalleryItem> => {
    const res = await apiClient.post<ApiResponseWrapper<ClubGalleryItem>>(`/api/v1/clubs/${clubId}/gallery`, data);
    return res.data.data;
  },

  deleteGalleryItem: async (clubId: number, itemId: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/clubs/${clubId}/gallery/${itemId}`);
  },

  // My Presidencies
  getMyPresidencies: async (): Promise<ClubPresident[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubPresident[]>>('/api/v1/clubs/my-presidencies');
    return res.data.data;
  },

  // Achievements
  getAchievements: async (clubId: number): Promise<ClubAchievement[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubAchievement[]>>(`/api/v1/clubs/${clubId}/achievements`);
    return res.data.data;
  },

  addAchievement: async (
    clubId: number,
    data: {
      title: string;
      description?: string;
      achievementDate: string;
      imageUrl?: string;
    }
  ): Promise<ClubAchievement> => {
    const res = await apiClient.post<ApiResponseWrapper<ClubAchievement>>(`/api/v1/clubs/${clubId}/achievements`, data);
    return res.data.data;
  },

  deleteAchievement: async (clubId: number, achievementId: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/clubs/${clubId}/achievements/${achievementId}`);
  },
};

// =============================================================================
// 2b. Admin Clubs API
// =============================================================================
export const adminClubsApi = {
  getAllClubs: async (params?: {
    category?: string;
    status?: string;
    keyword?: string;
  }): Promise<Club[]> => {
    const res = await apiClient.get<ApiResponseWrapper<Club[]>>('/api/v1/admin/clubs', { params });
    return res.data.data;
  },

  getClubById: async (id: number): Promise<Club> => {
    const res = await apiClient.get<ApiResponseWrapper<Club>>(`/api/v1/admin/clubs/${id}`);
    return res.data.data;
  },

  createClub: async (data: ClubRequest): Promise<Club> => {
    const res = await apiClient.post<ApiResponseWrapper<Club>>('/api/v1/admin/clubs', data);
    return res.data.data;
  },

  updateClub: async (id: number, data: ClubRequest): Promise<Club> => {
    const res = await apiClient.put<ApiResponseWrapper<Club>>(`/api/v1/admin/clubs/${id}`, data);
    return res.data.data;
  },

  updateClubStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Club> => {
    const res = await apiClient.patch<ApiResponseWrapper<Club>>(`/api/v1/admin/clubs/${id}/status`, { status });
    return res.data.data;
  },

  deleteClub: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/admin/clubs/${id}`);
  },

  getClubPresident: async (clubId: number): Promise<ClubPresident | null> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubPresident | null>>(`/api/v1/admin/clubs/${clubId}/president`);
    return res.data.data;
  },

  getClubPresidentHistory: async (clubId: number): Promise<ClubPresident[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ClubPresident[]>>(`/api/v1/admin/clubs/${clubId}/president/history`);
    return res.data.data;
  },

  assignClubPresident: async (
    clubId: number,
    data: { userId: number; designation?: string }
  ): Promise<ClubPresident> => {
    const res = await apiClient.post<ApiResponseWrapper<ClubPresident>>(`/api/v1/admin/clubs/${clubId}/president`, data);
    return res.data.data;
  },

  removeClubPresident: async (clubId: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/admin/clubs/${clubId}/president`);
  },

  getPresidentCandidates: async (search?: string): Promise<PresidentCandidate[]> => {
    const res = await apiClient.get<ApiResponseWrapper<PresidentCandidate[]>>('/api/v1/admin/clubs/president-candidates', {
      params: search ? { search } : undefined,
    });
    return res.data.data;
  },
};

// =============================================================================
// 3. Marketplace API
// =============================================================================
export const marketplaceApi = {
  searchListings: async (params?: {
    category?: MarketplaceCategory;
    status?: ListingStatus;
    conditionType?: ItemCondition;
    minPrice?: number;
    maxPrice?: number;
    keyword?: string;
  }): Promise<MarketplaceListing[]> => {
    const res = await apiClient.get<ApiResponseWrapper<MarketplaceListing[]>>('/api/v1/marketplace', { params });
    return res.data.data;
  },

  getMyListings: async (): Promise<MarketplaceListing[]> => {
    const res = await apiClient.get<ApiResponseWrapper<MarketplaceListing[]>>('/api/v1/marketplace/my');
    return res.data.data;
  },

  getListingById: async (id: number): Promise<MarketplaceListing> => {
    const res = await apiClient.get<ApiResponseWrapper<MarketplaceListing>>(`/api/v1/marketplace/${id}`);
    return res.data.data;
  },

  createListing: async (data: MarketplaceListingRequest): Promise<MarketplaceListing> => {
    const res = await apiClient.post<ApiResponseWrapper<MarketplaceListing>>('/api/v1/marketplace', data);
    return res.data.data;
  },

  updateListing: async (id: number, data: MarketplaceListingRequest): Promise<MarketplaceListing> => {
    const res = await apiClient.put<ApiResponseWrapper<MarketplaceListing>>(`/api/v1/marketplace/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: number, status: ListingStatus): Promise<MarketplaceListing> => {
    const res = await apiClient.patch<ApiResponseWrapper<MarketplaceListing>>(`/api/v1/marketplace/${id}/status`, { status });
    return res.data.data;
  },

  deleteListing: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/marketplace/${id}`);
  },
};

// =============================================================================
// 4. Lost & Found API
// =============================================================================
export const lostFoundApi = {
  searchReports: async (params?: {
    type?: LostFoundType;
    status?: ReportStatus;
    category?: LostFoundCategory;
    location?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
  }): Promise<LostFoundReport[]> => {
    const res = await apiClient.get<ApiResponseWrapper<LostFoundReport[]>>('/api/v1/lost-found', { params });
    return res.data.data;
  },

  getMyReports: async (): Promise<LostFoundReport[]> => {
    const res = await apiClient.get<ApiResponseWrapper<LostFoundReport[]>>('/api/v1/lost-found/my');
    return res.data.data;
  },

  getReportById: async (id: number): Promise<LostFoundReport> => {
    const res = await apiClient.get<ApiResponseWrapper<LostFoundReport>>(`/api/v1/lost-found/${id}`);
    return res.data.data;
  },

  createReport: async (data: LostFoundReportRequest): Promise<LostFoundReport> => {
    const res = await apiClient.post<ApiResponseWrapper<LostFoundReport>>('/api/v1/lost-found', data);
    return res.data.data;
  },

  updateReport: async (id: number, data: LostFoundReportRequest): Promise<LostFoundReport> => {
    const res = await apiClient.put<ApiResponseWrapper<LostFoundReport>>(`/api/v1/lost-found/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: number, status: ReportStatus): Promise<LostFoundReport> => {
    const res = await apiClient.patch<ApiResponseWrapper<LostFoundReport>>(`/api/v1/lost-found/${id}/status`, { status });
    return res.data.data;
  },

  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/lost-found/${id}`);
  },
};

// =============================================================================
// 5. Campus Wiki API
// =============================================================================
export const wikiApi = {
  searchPages: async (params?: {
    status?: WikiStatus;
    category?: CampusWikiCategory;
    keyword?: string;
  }): Promise<CampusWikiPage[]> => {
    const res = await apiClient.get<ApiResponseWrapper<CampusWikiPage[]>>('/api/v1/wiki', { params });
    return res.data.data;
  },

  getMyPages: async (): Promise<CampusWikiPage[]> => {
    const res = await apiClient.get<ApiResponseWrapper<CampusWikiPage[]>>('/api/v1/wiki/my');
    return res.data.data;
  },

  getPageById: async (id: number): Promise<CampusWikiPage> => {
    const res = await apiClient.get<ApiResponseWrapper<CampusWikiPage>>(`/api/v1/wiki/${id}`);
    return res.data.data;
  },

  getPageBySlug: async (slug: string): Promise<CampusWikiPage> => {
    const res = await apiClient.get<ApiResponseWrapper<CampusWikiPage>>(`/api/v1/wiki/slug/${slug}`);
    return res.data.data;
  },

  createPage: async (data: CampusWikiPageRequest): Promise<CampusWikiPage> => {
    const res = await apiClient.post<ApiResponseWrapper<CampusWikiPage>>('/api/v1/wiki', data);
    return res.data.data;
  },

  updatePage: async (id: number, data: CampusWikiPageRequest): Promise<CampusWikiPage> => {
    const res = await apiClient.put<ApiResponseWrapper<CampusWikiPage>>(`/api/v1/wiki/${id}`, data);
    return res.data.data;
  },

  moderatePage: async (id: number, data: { status: WikiStatus; rejectionReason?: string }): Promise<CampusWikiPage> => {
    const res = await apiClient.patch<ApiResponseWrapper<CampusWikiPage>>(`/api/v1/wiki/${id}/moderate`, data);
    return res.data.data;
  },

  deletePage: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponseWrapper<void>>(`/api/v1/wiki/${id}`);
  },
};

// =============================================================================
// 6. Badges API
// =============================================================================
export const badgesApi = {
  getAllBadges: async (): Promise<Badge[]> => {
    const res = await apiClient.get<ApiResponseWrapper<Badge[]>>('/api/v1/badges');
    return res.data.data;
  },

  getMyBadges: async (): Promise<UserBadge[]> => {
    const res = await apiClient.get<ApiResponseWrapper<UserBadge[]>>('/api/v1/badges/my');
    return res.data.data;
  },

  getUserBadges: async (userId: number): Promise<UserBadge[]> => {
    const res = await apiClient.get<ApiResponseWrapper<UserBadge[]>>(`/api/v1/badges/user/${userId}`);
    return res.data.data;
  },

  awardBadge: async (data: { userId: number; badgeId: number }): Promise<UserBadge> => {
    const res = await apiClient.post<ApiResponseWrapper<UserBadge>>('/api/v1/badges/award', data);
    return res.data.data;
  },
};
