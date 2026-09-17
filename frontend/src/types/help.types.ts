/**
 * CampusNexus — Help & Support Types
 * Phase 9 Help & Support System
 */

export type HelpCategory =
  | "ACCOUNT"
  | "ACADEMIC"
  | "COMMUNITY"
  | "CAREER"
  | "CAMPUS_LIFE"
  | "SEARCH"
  | "TECHNICAL"
  | "PRIVACY_SAFETY"
  | "GENERAL";

export interface HelpCategoryMeta {
  id: HelpCategory;
  label: string;
  description: string;
  iconName: string;
}

export interface FAQ {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category: HelpCategory;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export type SupportRequestPriority = "LOW" | "MEDIUM" | "HIGH";

export type SupportRequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportRequestMessage {
  id: string;
  authorId: string;
  authorName: string;
  isStaff: boolean;
  content: string;
  createdAt: string;
}

export interface SupportRequest {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: HelpCategory;
  priority: SupportRequestPriority;
  status: SupportRequestStatus;
  relatedRoute?: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportRequestMessage[];
}

export interface CreateSupportRequestInput {
  subject: string;
  category: HelpCategory;
  description: string;
  priority: SupportRequestPriority;
  relatedRoute?: string;
}

export interface FAQFilterParams {
  search?: string;
  category?: HelpCategory | "ALL";
}

export interface SupportRequestFilterParams {
  status?: SupportRequestStatus | "ALL";
  category?: HelpCategory | "ALL";
  search?: string;
}
