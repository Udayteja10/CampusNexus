import type { User } from "./user.types";

// ─── Resource Repository ─────────────────────────────────────────────────────

export type ResourceType =
  | "NOTES"
  | "PREVIOUS_PAPER"
  | "PPT"
  | "LAB_MANUAL"
  | "EBOOK"
  | "CODING_RESOURCE"
  | "OTHER";

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  subject: string;
  department: string;
  semester?: number;
  fileUrl: string;       // S3 URL
  previewUrl?: string;   // Cloudinary preview for images/PDFs
  fileSize?: number;     // bytes
  uploadedBy: User;
  upvotes: number;
  hasUpvoted: boolean;
  isBookmarked: boolean;
  downloadCount: number;
  commentsCount: number;
  version: number;
  tags?: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface ResourceVersion {
  id: string;
  resourceId: string;
  version: number;
  fileUrl: string;
  uploadedBy: User;
  changeNote?: string;
  createdAt: string;
}

// ─── Resource Request ────────────────────────────────────────────────────────

export interface ResourceRequest {
  id: string;
  requestedBy: User;
  title: string;
  description: string;
  subject: string;
  department?: string;
  semester?: number;
  status: "OPEN" | "FULFILLED" | "CLOSED";
  fulfilledBy?: User;
  fulfilledResourceId?: string;
  createdAt: string;
}

// ─── Study Group ─────────────────────────────────────────────────────────────

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  subject: string;
  department?: string;
  bannerUrl?: string;
  isPrivate: boolean;
  maxMembers?: number;
  memberCount: number;
  isMember: boolean;
  createdBy: User;
  createdAt: string;
}

// ─── Faculty ─────────────────────────────────────────────────────────────────

export interface Faculty {
  id: string;
  name: string;
  photoUrl?: string;
  department: string;
  designation: string;
  officialEmail?: string;
  officeLocation?: string;
  subjects: string[];
  bio?: string;
  averageRating: number;
  reviewsCount: number;
}

export interface FacultyReview {
  id: string;
  faculty: Pick<Faculty, "id" | "name" | "department">;
  author?: User;        // undefined when anonymous
  isAnonymous: boolean;
  teachingQuality: number;    // 1–5
  subjectKnowledge: number;   // 1–5
  communication: number;      // 1–5
  doubtClarification: number; // 1–5
  overallRating: number;      // computed average
  writtenReview?: string;
  createdAt: string;
}

export interface CreateFacultyReviewRequest {
  teachingQuality: number;
  subjectKnowledge: number;
  communication: number;
  doubtClarification: number;
  writtenReview?: string;
  isAnonymous: boolean;
}

// ─── Wiki ────────────────────────────────────────────────────────────────────

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;   // Markdown
  category: string;
  lastEditedBy: User;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WikiRevision {
  id: string;
  wikiPageId: string;
  version: number;
  content: string;
  editedBy: User;
  changeNote?: string;
  createdAt: string;
}
