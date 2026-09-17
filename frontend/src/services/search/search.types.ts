// ─── Phase 7: Global Search Types ──────────────────────────────────────────

export type SearchCategory =
  | "ALL"
  | "COMMUNITY"
  | "ACADEMIC"
  | "CAREER"
  | "CAMPUS_LIFE";

export type SearchResultType =
  // Community
  | "COMMUNITY_POST"
  // Academic
  | "ACADEMIC_RESOURCE"
  | "ACADEMIC_SUBJECT"
  | "ACADEMIC_FACULTY"
  | "ACADEMIC_STUDY_GROUP"
  | "ACADEMIC_WIKI"
  // Career
  | "CAREER_PLACEMENT"
  | "CAREER_INTERNSHIP"
  // Campus Life
  | "CAMPUS_CLUB"
  | "CAMPUS_EVENT"
  | "CAMPUS_MARKETPLACE"
  | "CAMPUS_LOST_FOUND";

export interface SearchResultMetadata {
  authorName?: string;
  department?: string;
  subjectCode?: string;
  subjectName?: string;
  company?: string;
  location?: string;
  date?: string;
  price?: number;
  status?: string;
  tags?: string[];
  roleTitle?: string;
  organizer?: string;
  categoryName?: string;
}

export interface SearchResult {
  id: string;
  type: SearchResultType;
  category: SearchCategory;
  title: string;
  description?: string;
  href: string;
  badgeLabel: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  metadata?: SearchResultMetadata;
  relevanceScore: number;
}

export interface SearchOptions {
  query: string;
  category?: SearchCategory;
  limit?: number;
}

export interface SearchGroupedResults {
  query: string;
  totalCount: number;
  results: SearchResult[];
  categoryCounts: Record<SearchCategory, number>;
}

export interface ISearchService {
  search(options: SearchOptions): Promise<SearchGroupedResults>;
  getRecentSearches(): string[];
  addRecentSearch(query: string): void;
  removeRecentSearch(query: string): void;
  clearRecentSearches(): void;
}
