// ─── Academic Enums & Literals ──────────────────────────────────────────────

export type ResourceType =
  | "NOTE"
  | "PYQ"
  | "SYLLABUS"
  | "LAB_MANUAL"
  | "ASSIGNMENT_SOLUTION"
  | "REFERENCE_BOOK"
  | "CHEATSHEET";

export type Semester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AcademicEventType =
  | "EXAM"
  | "HOLIDAY"
  | "SUBMISSION"
  | "FEST"
  | "GUEST_LECTURE"
  | "WORKSHOP";

export type EventScope = "college" | "department";

export type WikiCategory =
  | "CAMPUS_GUIDE"
  | "ACADEMIC_POLICIES"
  | "EXAM_RULES"
  | "LAB_PROTOCOLS"
  | "FAQ"
  | "GENERAL";

export type RequestStatus = "OPEN" | "FULFILLED" | "CLOSED";

// ─── Resource Domain ─────────────────────────────────────────────────────────

export interface ResourceVersion {
  versionNumber: number;
  fileUrl: string;
  fileSize: number; // bytes
  uploadedBy: string; // user name or id
  uploadedAt: string; // ISO date string
  changeLog?: string;
}

export interface AcademicResource {
  id: string;
  title: string;
  description?: string;
  departmentId: string; // "cse", "ece", etc.
  subjectCode: string; // e.g. "CS501PC"
  subjectName: string; // e.g. "Database Management Systems"
  semester: Semester;
  academicYear?: string; // e.g. "2024-2025"
  resourceType: ResourceType;
  fileUrl: string;
  fileType: string; // e.g. "pdf", "docx", "zip", "pptx"
  fileSize: number; // in bytes
  uploaderId: string;
  uploaderName: string;
  uploaderDepartment?: string;
  isVerifiedByCoordinator: boolean;
  verifiedBy?: string; // coordinator user id
  verifiedByName?: string;
  verifiedAt?: string;
  downloadsCount: number;
  upvotesCount: number;
  commentsCount: number;
  tags: string[];
  versions?: ResourceVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceBookmark {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface ResourceUpvote {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

// ─── Subject Domain ──────────────────────────────────────────────────────────

export interface Subject {
  code: string; // e.g. "CS501PC"
  name: string; // e.g. "Database Management Systems"
  departmentId: string; // "cse", "ece", etc.
  semester: Semester;
  credits: number;
  description: string;
  syllabusSummary?: string;
  totalResourcesCount?: number;
  facultyInCharge?: string[];
}

// ─── Study Groups Domain ─────────────────────────────────────────────────────

export interface StudyGroupMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  role: "LEADER" | "MEMBER";
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  subjectCode: string;
  subjectName: string;
  semester: Semester;
  leaderId: string;
  leaderName: string;
  membersCount: number;
  maxMembers: number;
  meetingLink?: string;
  meetingSchedule?: string; // e.g. "Tue & Thu 6:00 PM"
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
}

// ─── Faculty Domain ──────────────────────────────────────────────────────────

export interface Faculty {
  id: string;
  name: string;
  designation: string; // e.g. "Associate Professor & HOD", "Assistant Professor"
  departmentId: string;
  email: string;
  cabinLocation: string; // e.g. "Block B - Room 304"
  officeHours: string; // e.g. "Mon, Wed 2:00 PM - 4:00 PM"
  cabinImage?: string;
  specialization: string[];
  subjectsHandled: string[]; // Subject names
  rating: number; // 0 - 5 average
  reviewCount: number;
  isAcceptingStudents: boolean;
  bio?: string;
}

export interface FacultyReview {
  id: string;
  facultyId: string;
  studentId: string;
  studentName: string; // "Anonymous Student" or real name
  isAnonymous: boolean;
  rating: number; // 1 - 5
  tags: string[]; // e.g. "Clear Explanations", "Strict Grading", "Helpful"
  comment: string;
  semester: Semester;
  academicYear: string;
  createdAt: string;
}

// ─── Academic Calendar Domain ────────────────────────────────────────────────

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  scope: EventScope; // "college" or "department"
  departmentId?: string; // required if scope is "department"
  eventType: AcademicEventType;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location?: string;
  isImportant?: boolean;
}

// ─── Campus Wiki Domain ──────────────────────────────────────────────────────

export interface WikiArticle {
  id: string;
  slug: string;
  title: string;
  content: string; // markdown or HTML
  category: WikiCategory;
  departmentId?: string; // optional (articles can be general or department-focused, but visible to all)
  authorId: string;
  authorName: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  tags: string[];
  helpfulCount: number;
  viewsCount: number;
  createdAt: string;
}

// ─── Resource Requests Domain ────────────────────────────────────────────────

export interface AcademicRequest {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  subjectCode: string;
  subjectName: string;
  semester: Semester;
  resourceType: ResourceType;
  requesterId: string;
  requesterName: string;
  requesterDepartment?: string;
  status: RequestStatus;
  fulfilledResourceId?: string;
  fulfilledResourceTitle?: string;
  commentsCount: number;
  upvotesCount: number;
  createdAt: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  suggestedResourceUrl?: string;
  createdAt: string;
}

// ─── Filter & Query Parameters ───────────────────────────────────────────────

export interface ResourceFilters {
  departmentId?: string;
  subjectCode?: string;
  semester?: Semester;
  resourceType?: ResourceType;
  search?: string;
  verifiedOnly?: boolean;
  sortBy?: "newest" | "downloads" | "upvotes" | "title";
}

export interface FacultyFilters {
  departmentId?: string;
  search?: string;
  subject?: string;
  minRating?: number;
}

export interface StudyGroupFilters {
  departmentId?: string;
  subjectCode?: string;
  semester?: Semester;
  search?: string;
}

export interface AcademicRequestFilters {
  departmentId?: string;
  semester?: Semester;
  status?: RequestStatus;
  search?: string;
}
