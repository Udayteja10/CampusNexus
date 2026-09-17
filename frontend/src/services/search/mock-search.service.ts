import {
  ISearchService,
  SearchOptions,
  SearchResult,
  SearchGroupedResults,
  SearchCategory,
} from "./search.types";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { academicService } from "@/services/academic";
import { mockCareerService } from "@/services/career";
import { campusLifeService } from "@/services/campus-life";

const RECENT_SEARCHES_KEY = "cn_recent_searches";
const MAX_RECENT_SEARCHES = 8;

export class MockSearchService implements ISearchService {
  // ─── Recent Searches (localStorage) ────────────────────────────────────────

  getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
    } catch {
      return [];
    }
  }

  addRecentSearch(query: string): void {
    if (typeof window === "undefined") return;
    const clean = query.trim();
    if (!clean || clean.length < 2) return;

    try {
      const current = this.getRecentSearches();
      const filtered = current.filter((q) => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to update recent searches:", err);
    }
  }

  removeRecentSearch(query: string): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getRecentSearches();
      const updated = current.filter((q) => q.toLowerCase() !== query.trim().toLowerCase());
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to remove recent search:", err);
    }
  }

  clearRecentSearches(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error("Failed to clear recent searches:", err);
    }
  }

  // ─── Relevance Scoring Helper ──────────────────────────────────────────────

  private calculateScore(
    query: string,
    title: string,
    secondaryFields: (string | undefined | null)[] = [],
    bodyFields: (string | undefined | null)[] = []
  ): number {
    const q = query.toLowerCase().trim();
    const t = title.toLowerCase().trim();
    let score = 0;

    if (!q || !t) return 0;

    // Exact title match
    if (t === q) {
      score += 100;
    } else if (t.startsWith(q)) {
      score += 60;
    } else if (t.includes(q)) {
      score += 35;
    }

    // Secondary fields (subject codes, companies, tags, categories)
    for (const field of secondaryFields) {
      if (!field) continue;
      const f = field.toLowerCase();
      if (f === q) {
        score += 40;
      } else if (f.includes(q)) {
        score += 20;
      }
    }

    // Body content or description
    for (const field of bodyFields) {
      if (!field) continue;
      const b = field.toLowerCase();
      if (b.includes(q)) {
        score += 10;
        break;
      }
    }

    return score;
  }

  // ─── Core Global Search ────────────────────────────────────────────────────

  async search(options: SearchOptions): Promise<SearchGroupedResults> {
    const query = options.query?.trim() || "";
    const selectedCategory = options.category || "ALL";

    if (!query) {
      return {
        query: "",
        totalCount: 0,
        results: [],
        categoryCounts: {
          ALL: 0,
          COMMUNITY: 0,
          ACADEMIC: 0,
          CAREER: 0,
          CAMPUS_LIFE: 0,
        },
      };
    }

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Community Posts (Respecting Anonymity)
    if (selectedCategory === "ALL" || selectedCategory === "COMMUNITY") {
      try {
        const posts = await MockCommunityServiceInstance.getPosts({});
        for (const post of posts) {
          const firstLine = post.content.split("\n")[0] || post.content;
          const displayTitle = firstLine.length > 70 ? firstLine.slice(0, 70) + "…" : firstLine;
          const score = this.calculateScore(
            q,
            displayTitle,
            [post.category, ...(post.tags || [])],
            [post.content]
          );

          if (score > 0) {
            results.push({
              id: `post-${post.id}`,
              type: "COMMUNITY_POST",
              category: "COMMUNITY",
              title: displayTitle,
              description: post.content.slice(0, 160) + (post.content.length > 160 ? "…" : ""),
              href: `/community/post/${post.id}`,
              badgeLabel: "Community Post",
              badgeVariant: "secondary",
              metadata: {
                // NEVER expose real identity if post is anonymous
                authorName: post.isAnonymous ? "Anonymous Student" : post.author?.fullName || "Student",
                categoryName: post.category,
                tags: post.tags,
                date: post.createdAt,
              },
              relevanceScore: score,
            });
          }
        }
      } catch (err) {
        console.error("Community search failed:", err);
      }
    }

    // 2. Search Academic (Resources, Subjects, Faculty, Study Groups, Wiki)
    // Note: academicService automatically enforces department isolation based on current student role
    if (selectedCategory === "ALL" || selectedCategory === "ACADEMIC") {
      try {
        const [resources, subjects, facultyList, studyGroups, wikiArticles] =
          await Promise.all([
            academicService.getResources().catch(() => []),
            academicService.getSubjects().catch(() => []),
            academicService.getFacultyList().catch(() => []),
            academicService.getStudyGroups().catch(() => []),
            academicService.getWikiArticles().catch(() => []),
          ]);

        // Resources
        for (const r of resources) {
          const score = this.calculateScore(
            q,
            r.title,
            [r.subjectCode, r.subjectName, r.resourceType, ...(r.tags || [])],
            [r.description]
          );
          if (score > 0) {
            results.push({
              id: `res-${r.id}`,
              type: "ACADEMIC_RESOURCE",
              category: "ACADEMIC",
              title: r.title,
              description: r.description || `Study resource for ${r.subjectName} (${r.subjectCode})`,
              href: `/academic/resources/${r.id}`,
              badgeLabel: r.resourceType.replace("_", " "),
              badgeVariant: "outline",
              metadata: {
                subjectCode: r.subjectCode,
                subjectName: r.subjectName,
                department: r.departmentId.toUpperCase(),
                date: r.createdAt,
                tags: r.tags,
              },
              relevanceScore: score,
            });
          }
        }

        // Subjects
        for (const s of subjects) {
          const score = this.calculateScore(
            q,
            s.name,
            [s.code, `Semester ${s.semester}`],
            [s.description, s.syllabusSummary]
          );
          if (score > 0) {
            results.push({
              id: `subj-${s.code}`,
              type: "ACADEMIC_SUBJECT",
              category: "ACADEMIC",
              title: `${s.name} (${s.code})`,
              description: s.description || `Core course with ${s.credits} credits (Semester ${s.semester}).`,
              href: `/academic/subjects/${s.code}`,
              badgeLabel: "Subject",
              badgeVariant: "default",
              metadata: {
                subjectCode: s.code,
                department: s.departmentId.toUpperCase(),
              },
              relevanceScore: score,
            });
          }
        }

        // Faculty (Academic faculty directory only, NOT student profiles)
        for (const f of facultyList) {
          const score = this.calculateScore(
            q,
            f.name,
            [f.designation, f.departmentId, ...(f.specialization || []), ...(f.subjectsHandled || [])],
            [f.bio]
          );
          if (score > 0) {
            results.push({
              id: `fac-${f.id}`,
              type: "ACADEMIC_FACULTY",
              category: "ACADEMIC",
              title: f.name,
              description: `${f.designation} • ${f.departmentId.toUpperCase()} Department. Specialization: ${(f.specialization || []).slice(0, 3).join(", ")}`,
              href: `/academic/faculty/${f.id}`,
              badgeLabel: "Faculty",
              badgeVariant: "outline",
              metadata: {
                roleTitle: f.designation,
                department: f.departmentId.toUpperCase(),
                tags: f.specialization,
              },
              relevanceScore: score,
            });
          }
        }

        // Study Groups
        for (const g of studyGroups) {
          const score = this.calculateScore(
            q,
            g.name,
            [g.subjectCode, g.subjectName, ...(g.tags || [])],
            [g.description]
          );
          if (score > 0) {
            results.push({
              id: `sg-${g.id}`,
              type: "ACADEMIC_STUDY_GROUP",
              category: "ACADEMIC",
              title: g.name,
              description: g.description || `Study group for ${g.subjectName}`,
              href: `/academic/study-groups/${g.id}`,
              badgeLabel: "Study Group",
              badgeVariant: "secondary",
              metadata: {
                subjectCode: g.subjectCode,
                subjectName: g.subjectName,
                department: g.departmentId.toUpperCase(),
                tags: g.tags,
              },
              relevanceScore: score,
            });
          }
        }

        // Wiki (Shared college-wide knowledge)
        for (const w of wikiArticles) {
          const score = this.calculateScore(
            q,
            w.title,
            [w.category, ...(w.tags || [])],
            [w.content]
          );
          if (score > 0) {
            results.push({
              id: `wiki-${w.id}`,
              type: "ACADEMIC_WIKI",
              category: "ACADEMIC",
              title: w.title,
              description: w.content.slice(0, 150) + (w.content.length > 150 ? "…" : ""),
              href: `/academic/wiki/${w.slug}`,
              badgeLabel: "Wiki Article",
              badgeVariant: "outline",
              metadata: {
                categoryName: w.category,
                tags: w.tags,
                date: w.createdAt,
              },
              relevanceScore: score,
            });
          }
        }
      } catch (err) {
        console.error("Academic search failed:", err);
      }
    }

    // 3. Search Career (Placements & Internships)
    if (selectedCategory === "ALL" || selectedCategory === "CAREER") {
      try {
        const [placements, internships] = await Promise.all([
          mockCareerService.getPlacements().catch(() => []),
          mockCareerService.getInternships().catch(() => []),
        ]);

        // Placements
        for (const p of placements) {
          const score = this.calculateScore(
            q,
            `${p.role} at ${p.companyName}`,
            [p.companyName, p.role, p.location, p.domain, ...(p.requiredSkills || [])],
            [p.description]
          );
          if (score > 0) {
            results.push({
              id: `place-${p.id}`,
              type: "CAREER_PLACEMENT",
              category: "CAREER",
              title: `${p.role} — ${p.companyName}`,
              description: p.description?.slice(0, 160) + (p.description && p.description.length > 160 ? "…" : ""),
              href: `/career/placements/${p.id}`,
              badgeLabel: "Placement",
              badgeVariant: "default",
              metadata: {
                company: p.companyName,
                roleTitle: p.role,
                location: p.location,
                tags: p.requiredSkills,
                date: p.applicationDeadline,
              },
              relevanceScore: score,
            });
          }
        }

        // Internships
        for (const i of internships) {
          const score = this.calculateScore(
            q,
            `${i.role} at ${i.companyName}`,
            [i.companyName, i.role, i.location, i.domain, ...(i.requiredSkills || [])],
            [i.description]
          );
          if (score > 0) {
            results.push({
              id: `intern-${i.id}`,
              type: "CAREER_INTERNSHIP",
              category: "CAREER",
              title: `${i.role} — ${i.companyName}`,
              description: i.description?.slice(0, 160) + (i.description && i.description.length > 160 ? "…" : ""),
              href: `/career/internships/${i.id}`,
              badgeLabel: "Internship",
              badgeVariant: "outline",
              metadata: {
                company: i.companyName,
                roleTitle: i.role,
                location: i.location,
                tags: i.requiredSkills,
                date: i.applicationDeadline,
              },
              relevanceScore: score,
            });
          }
        }
      } catch (err) {
        console.error("Career search failed:", err);
      }
    }

    // 4. Search Campus Life (Clubs, Events, Marketplace, Lost & Found)
    if (selectedCategory === "ALL" || selectedCategory === "CAMPUS_LIFE") {
      try {
        const [clubs, events, marketplace, lostFound] = await Promise.all([
          campusLifeService.getClubs().catch(() => []),
          campusLifeService.getEvents().catch(() => []),
          campusLifeService.getMarketplaceListings().catch(() => []),
          campusLifeService.getLostFoundItems().catch(() => []),
        ]);

        // Clubs
        for (const c of clubs) {
          const score = this.calculateScore(
            q,
            c.name,
            [c.tagline, c.category, ...(c.activities || [])],
            [c.description, c.about]
          );
          if (score > 0) {
            results.push({
              id: `club-${c.id}`,
              type: "CAMPUS_CLUB",
              category: "CAMPUS_LIFE",
              title: c.name,
              description: c.tagline || c.description,
              href: `/campus-life/clubs/${c.id}`,
              badgeLabel: "Club",
              badgeVariant: "default",
              metadata: {
                categoryName: c.category,
                tags: c.activities?.slice(0, 3),
              },
              relevanceScore: score,
            });
          }
        }

        // Events
        for (const e of events) {
          const score = this.calculateScore(
            q,
            e.title,
            [e.organizer, e.eventType, e.category, ...(e.tags || [])],
            [e.description]
          );
          if (score > 0) {
            results.push({
              id: `evt-${e.id}`,
              type: "CAMPUS_EVENT",
              category: "CAMPUS_LIFE",
              title: e.title,
              description: e.description?.slice(0, 160) + (e.description && e.description.length > 160 ? "…" : ""),
              href: `/campus-life/events/${e.id}`,
              badgeLabel: `${e.eventType} Event`,
              badgeVariant: "secondary",
              metadata: {
                organizer: e.organizer,
                location: e.location,
                date: e.startDate,
                tags: e.tags,
              },
              relevanceScore: score,
            });
          }
        }

        // Marketplace (No private contact exposed)
        for (const m of marketplace) {
          const score = this.calculateScore(
            q,
            m.title,
            [m.category, m.condition, m.status],
            [m.description]
          );
          if (score > 0) {
            results.push({
              id: `mkt-${m.id}`,
              type: "CAMPUS_MARKETPLACE",
              category: "CAMPUS_LIFE",
              title: m.title,
              description: m.description,
              href: `/campus-life/marketplace`,
              badgeLabel: `Marketplace • ₹${m.price}`,
              badgeVariant: "outline",
              metadata: {
                categoryName: m.category,
                price: m.price,
                status: m.status,
                authorName: m.sellerName,
              },
              relevanceScore: score,
            });
          }
        }

        // Lost & Found (No private contact exposed)
        for (const lf of lostFound) {
          const score = this.calculateScore(
            q,
            lf.title,
            [lf.type, lf.category, lf.location, lf.status],
            [lf.description]
          );
          if (score > 0) {
            results.push({
              id: `lf-${lf.id}`,
              type: "CAMPUS_LOST_FOUND",
              category: "CAMPUS_LIFE",
              title: lf.title,
              description: lf.description,
              href: `/campus-life/lost-found`,
              badgeLabel: `${lf.type === "LOST" ? "Lost" : "Found"} Item`,
              badgeVariant: lf.type === "LOST" ? "destructive" : "secondary",
              metadata: {
                categoryName: lf.category,
                location: lf.location,
                status: lf.status,
                date: lf.incidentDate,
              },
              relevanceScore: score,
            });
          }
        }
      } catch (err) {
        console.error("Campus Life search failed:", err);
      }
    }

    // Sort strictly by relevance score descending
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Compute category counts
    const categoryCounts: Record<SearchCategory, number> = {
      ALL: results.length,
      COMMUNITY: 0,
      ACADEMIC: 0,
      CAREER: 0,
      CAMPUS_LIFE: 0,
    };

    for (const r of results) {
      if (r.category in categoryCounts) {
        categoryCounts[r.category]++;
      }
    }

    // Filter by category if specific category is requested
    const filteredResults =
      selectedCategory === "ALL"
        ? results
        : results.filter((r) => r.category === selectedCategory);

    // Add to recent searches when performing a valid search
    this.addRecentSearch(query);

    return {
      query,
      totalCount: filteredResults.length,
      results: options.limit ? filteredResults.slice(0, options.limit) : filteredResults,
      categoryCounts,
    };
  }
}

export const mockSearchService = new MockSearchService();
