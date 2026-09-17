import {
  Club,
  ClubCategory,
  ClubLeaderInfo,
  ClubMembership,
  CampusEvent,
  EventCategory,
  EventType,
  EventStatus,
  EventRegistration,
  SportsActivity,
  SportsFacility,
  SportsTournament,
  CampusFacility,
  FacilityCategory,
  LostFoundItem,
  LostFoundType,
  LostFoundStatus,
  LostFoundCategory,
  MarketplaceListing,
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceStatus,
  TransportRoute,
  HostelInfo,
  CampusDirectoryEntry,
  DirectoryCategory,
} from "@/types/campus-life.types";

export * from "@/types/campus-life.types";

export interface ClubFilterParams {
  search?: string;
  category?: ClubCategory | "ALL";
}

export interface EventFilterParams {
  search?: string;
  category?: EventCategory | "ALL";
  eventType?: EventType | "ALL";
  status?: EventStatus | "ALL";
  clubId?: string;
  upcomingOnly?: boolean;
}

export interface LostFoundFilterParams {
  search?: string;
  type?: LostFoundType | "ALL";
  category?: LostFoundCategory | "ALL";
  status?: LostFoundStatus | "ALL";
  myItemsOnly?: boolean;
}

export interface MarketplaceFilterParams {
  search?: string;
  category?: MarketplaceCategory | "ALL";
  condition?: MarketplaceCondition | "ALL";
  status?: MarketplaceStatus | "ALL";
  minPrice?: number;
  maxPrice?: number;
  myListingsOnly?: boolean;
}

export interface ICampusLifeService {
  // ─── Clubs ─────────────────────────────────────────────────────────────────
  getClubs(params?: ClubFilterParams): Promise<Club[]>;
  getClubById(id: string): Promise<Club | null>;
  getClubLeaders(clubId: string): Promise<ClubLeaderInfo[]>;
  getMyClubMemberships(): Promise<ClubMembership[]>;
  isClubMember(clubId: string): Promise<boolean>;
  getClubMembers(clubId: string): Promise<ClubMembership[]>;
  joinClub(clubId: string): Promise<ClubMembership>;
  leaveClub(clubId: string): Promise<void>;
  assignClubLeader(clubId: string, userId: string, roleTitle: string): Promise<void>;
  removeClubLeader(clubId: string, userId: string): Promise<void>;

  // ─── Events (Club, Campus, Sports unified) ──────────────────────────────────
  getEvents(params?: EventFilterParams): Promise<CampusEvent[]>;
  getEventById(id: string): Promise<CampusEvent | null>;
  getClubEvents(clubId: string): Promise<CampusEvent[]>;
  getMyEventRegistrations(): Promise<EventRegistration[]>;
  isRegisteredForEvent(eventId: string): Promise<boolean>;
  registerForEvent(eventId: string): Promise<EventRegistration>;
  cancelEventRegistration(eventId: string): Promise<void>;

  // Admin Event Management
  createEvent(data: Omit<CampusEvent, "id" | "registeredCount" | "createdAt" | "updatedAt">): Promise<CampusEvent>;
  updateEvent(id: string, updates: Partial<CampusEvent>): Promise<CampusEvent>;
  deleteEvent(id: string): Promise<void>;

  // ─── Sports ────────────────────────────────────────────────────────────────
  getSportsActivities(): Promise<SportsActivity[]>;
  getSportsFacilities(): Promise<SportsFacility[]>;
  getSportsTournaments(): Promise<SportsTournament[]>;
  getSportsEvents(): Promise<CampusEvent[]>;

  // ─── Campus Facilities ─────────────────────────────────────────────────────
  getFacilities(category?: FacilityCategory | "ALL"): Promise<CampusFacility[]>;
  getFacilityById(id: string): Promise<CampusFacility | null>;

  // ─── Lost & Found ──────────────────────────────────────────────────────────
  getLostFoundItems(params?: LostFoundFilterParams): Promise<LostFoundItem[]>;
  getLostFoundItemById(id: string): Promise<LostFoundItem | null>;
  createLostFoundItem(data: Omit<LostFoundItem, "id" | "authorId" | "authorName" | "authorDepartment" | "createdAt" | "updatedAt">): Promise<LostFoundItem>;
  updateLostFoundItem(id: string, updates: Partial<LostFoundItem>): Promise<LostFoundItem>;
  resolveLostFoundItem(id: string): Promise<LostFoundItem>;
  deleteLostFoundItem(id: string): Promise<void>;

  // ─── Campus Marketplace ────────────────────────────────────────────────────
  getMarketplaceListings(params?: MarketplaceFilterParams): Promise<MarketplaceListing[]>;
  getMarketplaceListingById(id: string): Promise<MarketplaceListing | null>;
  createMarketplaceListing(data: Omit<MarketplaceListing, "id" | "sellerId" | "sellerName" | "sellerDepartment" | "createdAt" | "updatedAt">): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing>;
  markListingSold(id: string): Promise<MarketplaceListing>;
  deleteMarketplaceListing(id: string): Promise<void>;

  // ─── Transport ─────────────────────────────────────────────────────────────
  getTransportRoutes(): Promise<TransportRoute[]>;
  getTransportRouteById(id: string): Promise<TransportRoute | null>;

  // ─── Hostel ────────────────────────────────────────────────────────────────
  getHostelInfo(): Promise<HostelInfo>;

  // ─── Campus Directory ──────────────────────────────────────────────────────
  getDirectoryEntries(category?: DirectoryCategory | "ALL", search?: string): Promise<CampusDirectoryEntry[]>;
}
