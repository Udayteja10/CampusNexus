// ─── Phase 6: Campus Life Types ──────────────────────────────────────────────

export type ClubCategory =
  | "TECHNICAL"
  | "CULTURAL"
  | "SOCIAL"
  | "LITERARY"
  | "SPORTS"
  | "ENTREPRENEURSHIP"
  | "COMMUNITY";

export type ClubMembershipRole = "MEMBER" | "LEADER";

export interface ClubLeaderInfo {
  id: string;
  name: string;
  roleTitle: string; // e.g. "President", "Vice President", "Secretary", "Convener"
  avatarUrl?: string;
  department?: string;
  year?: number;
}

export interface Club {
  id: string;
  name: string; // Exactly one of: CAME, EWB, Apex, Sports, SCOPE, NSS, CIE, Club Literati, CSI
  tagline: string;
  description: string;
  about: string;
  category: ClubCategory;
  logoUrl?: string;
  bannerUrl?: string;
  facultyCoordinator?: string;
  leaders: ClubLeaderInfo[];
  membershipCount: number;
  activities: string[];
  contactEmail: string;
  meetingSchedule?: string;
  roomVenue?: string;
  createdAt: string;
}

export interface ClubMembership {
  id: string;
  clubId: string;
  clubName: string;
  userId: string;
  role: ClubMembershipRole;
  joinedAt: string;
}

// ─── Unified Event Architecture (Club, Campus, Sports) ────────────────────────

export type EventType = "CLUB" | "CAMPUS" | "SPORTS";

export type EventCategory =
  | "TECHNICAL"
  | "CULTURAL"
  | "SPORTS"
  | "LITERARY"
  | "SOCIAL"
  | "ENTREPRENEURSHIP"
  | "WORKSHOP"
  | "COMPETITION"
  | "SEMINAR"
  | "FESTIVAL";

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  category: EventCategory;
  organizer: string; // e.g. "CSI", "Club Literati", "Sports Committee", "Student Affairs"
  organizerId?: string; // Explicit clubId for CLUB events
  startDate: string; // ISO date string or "YYYY-MM-DD"
  endDate?: string;
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "04:00 PM"
  location: string; // e.g. "Main Auditorium", "Computing Lab 3", "Sports Ground"
  imageUrl?: string;
  status: EventStatus;
  capacity?: number;
  registeredCount: number;
  registrationDeadline: string; // ISO date string
  isRegistrationOpen: boolean;
  registrationFee?: number; // 0 for free
  tags: string[];
  requirements?: string[];
  sportsMetadata?: {
    sportName: string;
    fixtureType?: string; // e.g. "Knockout", "League"
    rulesUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment?: string;
  registeredAt: string;
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED";
}

// ─── Sports ───────────────────────────────────────────────────────────────────

export type SportsCategory = "OUTDOOR" | "INDOOR" | "FITNESS" | "AQUATICS" | "MARTIAL_ARTS";

export interface SportsActivity {
  id: string;
  name: string; // e.g. "Cricket", "Badminton", "Basketball", "Table Tennis", "Football", "Chess", "Athletics", "Gym & Fitness"
  category: SportsCategory;
  venue: string;
  coachName?: string;
  practiceTimings: string;
  equipmentAvailable: boolean;
  captainName?: string;
  captainContact?: string;
  description: string;
  iconName?: string;
}

export interface SportsFacility {
  id: string;
  name: string;
  type: string;
  timings: string;
  location: string;
  amenities: string[];
  rules: string[];
}

export interface SportsTournament {
  id: string;
  title: string; // e.g. "Inter-Year Cricket Championship", "Annual Badminton Open"
  sport: string;
  dateRange: string;
  venue: string;
  eligibility: string; // "Open to all students"
  registrationDeadline: string;
  isOpenForRegistration: boolean;
  contactPerson: string;
  rulesDocUrl?: string;
}

// ─── Campus Facilities ────────────────────────────────────────────────────────

export type FacilityCategory =
  | "ACADEMIC"
  | "SPORTS"
  | "AUDITORIUM"
  | "HEALTHCARE"
  | "STUDENT_CENTER"
  | "ADMINISTRATION"
  | "RECREATION";

export interface CampusFacility {
  id: string;
  name: string; // e.g. "Central Library", "Advanced Computing Lab", "Main Auditorium"
  category: FacilityCategory;
  description: string;
  location: string; // e.g. "Block-A, Ground Floor"
  operatingHours: string; // e.g. "8:00 AM – 8:00 PM (Mon-Sat)"
  services: string[];
  inChargeName?: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity?: number;
  imageUrl?: string;
  guidelines?: string[];
}

// ─── Lost & Found ─────────────────────────────────────────────────────────────

export type LostFoundType = "LOST" | "FOUND";
export type LostFoundStatus = "OPEN" | "RESOLVED" | "CLAIMED";
export type LostFoundCategory =
  | "ELECTRONICS"
  | "ID_CARD"
  | "BOOKS_DOCS"
  | "KEYS"
  | "BAGS_WALLETS"
  | "ACCESSORIES"
  | "OTHER";

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  type: LostFoundType;
  category: LostFoundCategory;
  location: string; // Where lost or found
  incidentDate: string; // ISO date string
  status: LostFoundStatus;
  imageUrl?: string;
  contactName: string;
  contactNote: string; // e.g. "Handed over to Room 204 Security" or "Contact via in-app message"
  authorId: string;
  authorName: string;
  authorDepartment?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Campus Marketplace ───────────────────────────────────────────────────────

export type MarketplaceCategory =
  | "TEXTBOOKS"
  | "ELECTRONICS"
  | "CALCULATORS"
  | "DRAWING_TOOLS"
  | "BICYCLES"
  | "ROOM_ESSENTIALS"
  | "NOTES_STUDY_MATERIAL"
  | "OTHER";

export type MarketplaceCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
export type MarketplaceStatus = "AVAILABLE" | "PENDING" | "SOLD";

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  price: number; // in INR (₹)
  isNegotiable: boolean;
  condition: MarketplaceCondition;
  imageUrl?: string;
  status: MarketplaceStatus;
  sellerId: string;
  sellerName: string;
  sellerDepartment?: string;
  sellerContactNote: string; // e.g. "Contact via in-app messenger or meet at SAC"
  createdAt: string;
  updatedAt: string;
}

// ─── Transport ────────────────────────────────────────────────────────────────

export interface TransportStop {
  stopName: string;
  morningPickupTime: string; // e.g. "07:30 AM"
  eveningDropTime: string; // e.g. "05:45 PM"
  landmark?: string;
}

export interface TransportRoute {
  id: string;
  routeNumber: string; // e.g. "Route 1", "Route 2", "Route 5"
  routeName: string; // e.g. "Secunderabad - Campus Expressway"
  driverName: string;
  driverPhone: string;
  busNumber: string;
  capacity: number;
  stops: TransportStop[];
  operatingDays: string; // e.g. "Monday – Saturday"
  feePerSemester?: number;
  inChargeContact: string;
}

// ─── Hostel ───────────────────────────────────────────────────────────────────

export interface HostelBlock {
  id: string;
  name: string; // e.g. "Block A (Gargi Hall)", "Block B (Aryabhatta Hall)"
  gender: "BOYS" | "GIRLS";
  capacity: number;
  floors: number;
  wardenName: string;
  wardenContact: string;
  wardenEmail: string;
  amenities: string[];
  description: string;
}

export interface HostelInfo {
  blocks: HostelBlock[];
  generalAmenities: string[];
  messTimings: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  rulesAndGuidelines: string[];
  chiefWarden: {
    name: string;
    office: string;
    contact: string;
    email: string;
  };
}

// ─── Campus Directory ─────────────────────────────────────────────────────────

export type DirectoryCategory =
  | "ADMINISTRATION"
  | "ACADEMIC_OFFICE"
  | "EXAMINATION"
  | "STUDENT_AFFAIRS"
  | "HELPDESK"
  | "EMERGENCY"
  | "SECURITY"
  | "IT_SERVICES";

export interface CampusDirectoryEntry {
  id: string;
  officeName: string;
  category: DirectoryCategory;
  headName: string;
  designation: string;
  location: string;
  operatingHours: string;
  contactNumber: string;
  email: string;
  servicesProvided: string[];
}
