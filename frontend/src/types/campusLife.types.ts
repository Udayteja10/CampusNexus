export type CalendarEventType =
  | 'ACADEMIC'
  | 'EXAM'
  | 'HOLIDAY'
  | 'REGISTRATION'
  | 'EVENT'
  | 'OTHER';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  yearOfStudy?: number;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  departmentId?: number;
  yearOfStudy?: number;
}

export type ClubCategory =
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'SPORTS'
  | 'LITERARY'
  | 'SOCIAL'
  | 'ACADEMIC'
  | 'OTHER';

export interface ClubPresident {
  id: number;
  clubId: number;
  clubName?: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  htno?: string;
  designation: string;
  active: boolean;
  assignedAt: string;
  assignedById?: number;
  assignedByName?: string;
  removedAt?: string;
  removedById?: number;
  removedByName?: string;
}

export interface PresidentCandidate {
  id: number;
  fullName: string;
  username: string;
  email: string;
  htno?: string;
  departmentCode?: string;
  departmentName?: string;
  yearOfStudy?: number;
}

export interface Club {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  logoUrl?: string;
  coverUrl?: string;
  contactEmail?: string;
  socialLinks?: string;
  status: string;
  currentPresident?: ClubPresident | null;
  canManage?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ClubAnnouncement {
  id: number;
  clubId: number;
  clubName?: string;
  title: string;
  content: string;
  publishedAt: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
}

export interface ClubEvent {
  id: number;
  clubId: number;
  clubName?: string;
  title: string;
  description?: string;
  venue?: string;
  startDateTime: string;
  endDateTime: string;
  registrationLink?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClubGalleryItem {
  id: number;
  clubId: number;
  imageUrl: string;
  caption?: string;
  uploadedById?: number;
  uploadedByName?: string;
  createdAt: string;
}

export interface ClubAchievement {
  id: number;
  clubId: number;
  title: string;
  description?: string;
  achievementDate: string;
  imageUrl?: string;
  createdAt: string;
}

export type MarketplaceCategory =
  | 'BOOKS'
  | 'ELECTRONICS'
  | 'CALCULATORS'
  | 'STUDY_MATERIALS'
  | 'FURNITURE'
  | 'OTHER';

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CLOSED';

export interface MarketplaceListing {
  id: number;
  sellerId: number;
  sellerName?: string;
  sellerEmail?: string;
  sellerDepartment?: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  conditionType: ItemCondition;
  imageUrl?: string;
  contactPhone?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceListingRequest {
  title: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  conditionType: ItemCondition;
  imageUrl?: string;
  contactPhone?: string;
}

export type LostFoundType = 'LOST' | 'FOUND';
export type LostFoundCategory =
  | 'ELECTRONICS'
  | 'ID_CARDS'
  | 'BOOKS_NOTES'
  | 'KEYS'
  | 'WALLET'
  | 'ACCESSORIES'
  | 'CLOTHING'
  | 'OTHER';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';

export interface LostFoundReport {
  id: number;
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  eventDate: string;
  imageUrl?: string;
  contactInfo?: string;
  status: ReportStatus;
  reportedById: number;
  reportedByName?: string;
  reportedByEmail?: string;
  reportedByDepartment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LostFoundReportRequest {
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  eventDate: string;
  imageUrl?: string;
  contactInfo?: string;
}

export type CampusWikiCategory =
  | 'ACADEMICS'
  | 'CAMPUS'
  | 'FACILITIES'
  | 'DEPARTMENTS'
  | 'STUDENT_RESOURCES'
  | 'FAQ'
  | 'OTHER';

export type WikiStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

export interface CampusWikiPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: CampusWikiCategory;
  authorId: number;
  authorName?: string;
  authorEmail?: string;
  status: WikiStatus;
  rejectionReason?: string;
  viewsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CampusWikiPageRequest {
  title: string;
  slug?: string;
  content: string;
  category: CampusWikiCategory;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria?: string;
  createdAt: string;
}

export interface UserBadge {
  id: number;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeCriteria?: string;
  awardedAt: string;
  awardedById?: number;
  awardedByName?: string;
}
