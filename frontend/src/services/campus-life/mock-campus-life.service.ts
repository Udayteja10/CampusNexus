import { useAuthStore } from "@/store/auth.store";
import {
  Club,
  ClubLeaderInfo,
  ClubMembership,
  ClubMembershipRole,
  CampusEvent,
  EventRegistration,
  SportsActivity,
  SportsFacility,
  SportsTournament,
  CampusFacility,
  FacilityCategory,
  LostFoundItem,
  MarketplaceListing,
  TransportRoute,
  HostelInfo,
  CampusDirectoryEntry,
  DirectoryCategory,
  ClubFilterParams,
  EventFilterParams,
  LostFoundFilterParams,
  MarketplaceFilterParams,
  ICampusLifeService,
} from "./campus-life.types";
import {
  SEED_CLUBS,
  SEED_MEMBERSHIPS,
  SEED_EVENTS,
  SEED_SPORTS_ACTIVITIES,
  SEED_SPORTS_FACILITIES,
  SEED_SPORTS_TOURNAMENTS,
  SEED_FACILITIES,
  SEED_LOST_FOUND,
  SEED_MARKETPLACE,
  SEED_TRANSPORT,
  SEED_HOSTEL_INFO,
  SEED_DIRECTORY,
} from "./campus-life.seed";

// ─── LocalStorage Keys ────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  CLUBS: "cn_campus_clubs",
  MEMBERSHIPS: "cn_campus_memberships",
  EVENTS: "cn_campus_events",
  EVENT_REGISTRATIONS: "cn_campus_event_registrations",
  SPORTS_ACTIVITIES: "cn_campus_sports_activities",
  SPORTS_FACILITIES: "cn_campus_sports_facilities",
  SPORTS_TOURNAMENTS: "cn_campus_sports_tournaments",
  FACILITIES: "cn_campus_facilities",
  LOST_FOUND: "cn_campus_lost_found",
  MARKETPLACE: "cn_campus_marketplace",
  TRANSPORT: "cn_campus_transport",
  HOSTEL: "cn_campus_hostel",
  DIRECTORY: "cn_campus_directory",
  SEEDED: "cn_campus_life_seeded",
} as const;

export class MockCampusLifeService implements ICampusLifeService {
  constructor() {
    if (typeof window !== "undefined") {
      this.ensureSeeded();
    }
  }

  // ─── Internal Storage Helpers ────────────────────────────────────────────────

  private getStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`Failed to save to localStorage [${key}]:`, err);
    }
  }

  // Robust data migration for memberships: converts CO_LEADER / CORE_MEMBER -> MEMBER, deduplicates
  private getCleanMemberships(): ClubMembership[] {
    const raw = this.getStorage<(ClubMembership & { role?: string })[]>(
      STORAGE_KEYS.MEMBERSHIPS,
      SEED_MEMBERSHIPS
    );
    let changed = false;
    const seen = new Set<string>();
    const clean: ClubMembership[] = [];

    for (const item of raw) {
      if (!item || !item.clubId || !item.userId) continue;
      const clubId = String(item.clubId);
      const userId = String(item.userId);
      const key = `${clubId}_${userId}`;
      if (seen.has(key)) {
        changed = true;
        continue; // eliminate duplicates
      }
      seen.add(key);

      let role: ClubMembershipRole = "MEMBER";
      if (item.role === "LEADER") {
        role = "LEADER";
      } else {
        if (item.role !== "MEMBER") {
          changed = true; // migrated legacy CO_LEADER / CORE_MEMBER
        }
        role = "MEMBER";
      }

      clean.push({
        id: (item.id as string) || `mem-${clubId}-${userId}`,
        clubId,
        clubName: (item.clubName as string) || "Club",
        userId,
        role,
        joinedAt: (item.joinedAt as string) || new Date().toISOString(),
      });
    }

    if (changed) {
      this.setStorage(STORAGE_KEYS.MEMBERSHIPS, clean);
    }
    return clean;
  }

  private ensureSeeded(): void {
    if (typeof window === "undefined") return;
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.setStorage(STORAGE_KEYS.CLUBS, SEED_CLUBS);
      this.setStorage(STORAGE_KEYS.MEMBERSHIPS, SEED_MEMBERSHIPS);
      this.setStorage(STORAGE_KEYS.EVENTS, SEED_EVENTS);
      this.setStorage(STORAGE_KEYS.EVENT_REGISTRATIONS, []);
      this.setStorage(STORAGE_KEYS.SPORTS_ACTIVITIES, SEED_SPORTS_ACTIVITIES);
      this.setStorage(STORAGE_KEYS.SPORTS_FACILITIES, SEED_SPORTS_FACILITIES);
      this.setStorage(STORAGE_KEYS.SPORTS_TOURNAMENTS, SEED_SPORTS_TOURNAMENTS);
      this.setStorage(STORAGE_KEYS.FACILITIES, SEED_FACILITIES);
      this.setStorage(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
      this.setStorage(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);
      this.setStorage(STORAGE_KEYS.TRANSPORT, SEED_TRANSPORT);
      this.setStorage(STORAGE_KEYS.HOSTEL, SEED_HOSTEL_INFO);
      this.setStorage(STORAGE_KEYS.DIRECTORY, SEED_DIRECTORY);
      localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
    }
  }

  private getCurrentUser() {
    return useAuthStore.getState().user;
  }

  // ─── 1. Clubs (College-Wide, No Department Isolation) ───────────────────────

  async getClubs(params?: ClubFilterParams): Promise<Club[]> {
    this.ensureSeeded();
    let list = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== "ALL") {
      list = list.filter((c) => c.category === params.category);
    }

    return list;
  }

  async getClubById(id: string): Promise<Club | null> {
    this.ensureSeeded();
    const list = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const club = list.find((c) => c.id === id);
    if (!club) return null;

    // Single Authoritative Leadership Source: derived dynamically from ClubMembership[] with role === "LEADER"
    const leaderMemberships = this.getCleanMemberships().filter(
      (m) => m.clubId === id && m.role === "LEADER"
    );

    const derivedLeaders: ClubLeaderInfo[] = leaderMemberships.map((m) => {
      const existing = club.leaders?.find((l) => l.id === m.userId);
      return (
        existing || {
          id: m.userId,
          name: "Club Leader",
          roleTitle: "Student Leader",
        }
      );
    });

    return {
      ...club,
      leaders: derivedLeaders,
    };
  }

  async getClubLeaders(clubId: string): Promise<ClubLeaderInfo[]> {
    const club = await this.getClubById(clubId);
    return club?.leaders || [];
  }

  async getMyClubMemberships(): Promise<ClubMembership[]> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];
    const all = this.getCleanMemberships();
    return all.filter((m) => m.userId === user.id);
  }

  async isClubMember(clubId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;
    const myMemberships = await this.getMyClubMemberships();
    return myMemberships.some((m) => m.clubId === clubId);
  }

  async getClubMembers(clubId: string): Promise<ClubMembership[]> {
    this.ensureSeeded();
    const all = this.getCleanMemberships();
    return all.filter((m) => m.clubId === clubId);
  }

  async joinClub(clubId: string): Promise<ClubMembership> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be signed in to join a club.");
    }

    const clubs = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const club = clubs.find((c) => c.id === clubId);
    if (!club) {
      throw new Error("Club not found.");
    }

    const memberships = this.getCleanMemberships();
    const alreadyMember = memberships.some((m) => m.clubId === clubId && m.userId === user.id);
    if (alreadyMember) {
      throw new Error("You are already a member of this club.");
    }

    // Role is strictly MEMBER upon student joining. Students cannot self-promote to LEADER.
    const newMembership: ClubMembership = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clubId: club.id,
      clubName: club.name,
      userId: user.id,
      role: "MEMBER",
      joinedAt: new Date().toISOString(),
    };

    memberships.push(newMembership);
    this.setStorage(STORAGE_KEYS.MEMBERSHIPS, memberships);

    // Update club member count
    const updatedClubs = clubs.map((c) =>
      c.id === clubId ? { ...c, membershipCount: c.membershipCount + 1 } : c
    );
    this.setStorage(STORAGE_KEYS.CLUBS, updatedClubs);

    return newMembership;
  }

  async leaveClub(clubId: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be signed in to leave a club.");
    }

    const memberships = this.getCleanMemberships();
    const existing = memberships.find((m) => m.clubId === clubId && m.userId === user.id);
    if (!existing) {
      throw new Error("You are not an active member of this club.");
    }

    const filtered = memberships.filter((m) => !(m.clubId === clubId && m.userId === user.id));
    this.setStorage(STORAGE_KEYS.MEMBERSHIPS, filtered);

    // Update club member count
    const clubs = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const updatedClubs = clubs.map((c) =>
      c.id === clubId ? { ...c, membershipCount: Math.max(0, c.membershipCount - 1) } : c
    );
    this.setStorage(STORAGE_KEYS.CLUBS, updatedClubs);
  }

  async assignClubLeader(clubId: string, userId: string, roleTitle: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only an Administrator can assign club leadership.");
    }

    const clubs = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const club = clubs.find((c) => c.id === clubId);
    if (!club) throw new Error("Club not found.");

    const memberships = this.getCleanMemberships();
    const userMem = memberships.find((m) => m.clubId === clubId && m.userId === userId);
    if (userMem) {
      userMem.role = "LEADER";
    } else {
      memberships.push({
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clubId: club.id,
        clubName: club.name,
        userId,
        role: "LEADER",
        joinedAt: new Date().toISOString(),
      });
    }
    this.setStorage(STORAGE_KEYS.MEMBERSHIPS, memberships);

    // Update leader metadata in club store
    const existingLeaders = club.leaders || [];
    const updatedLeaders = [
      ...existingLeaders.filter((l) => l.id !== userId),
      {
        id: userId,
        name: userMem ? "Club Leader" : "Assigned Leader",
        roleTitle: roleTitle || "Student Leader",
      },
    ];

    const updatedClubs = clubs.map((c) =>
      c.id === clubId ? { ...c, leaders: updatedLeaders } : c
    );
    this.setStorage(STORAGE_KEYS.CLUBS, updatedClubs);
  }

  async removeClubLeader(clubId: string, userId: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only an Administrator can change club leadership.");
    }

    const clubs = this.getStorage<Club[]>(STORAGE_KEYS.CLUBS, SEED_CLUBS);
    const club = clubs.find((c) => c.id === clubId);
    if (!club) throw new Error("Club not found.");

    const memberships = this.getCleanMemberships();
    const userMem = memberships.find((m) => m.clubId === clubId && m.userId === userId);
    if (userMem) {
      userMem.role = "MEMBER";
      this.setStorage(STORAGE_KEYS.MEMBERSHIPS, memberships);
    }

    const updatedLeaders = (club.leaders || []).filter((l) => l.id !== userId);
    const updatedClubs = clubs.map((c) =>
      c.id === clubId ? { ...c, leaders: updatedLeaders } : c
    );
    this.setStorage(STORAGE_KEYS.CLUBS, updatedClubs);
  }

  // ─── 2. Unified Events (Club, Campus, Sports) ────────────────────────────────

  async getEvents(params?: EventFilterParams): Promise<CampusEvent[]> {
    this.ensureSeeded();
    let list = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.category && params.category !== "ALL") {
      list = list.filter((e) => e.category === params.category);
    }

    if (params?.eventType && params.eventType !== "ALL") {
      list = list.filter((e) => e.eventType === params.eventType);
    }

    if (params?.status && params.status !== "ALL") {
      list = list.filter((e) => e.status === params.status);
    }

    if (params?.clubId) {
      list = list.filter((e) => e.organizerId === params.clubId);
    }

    if (params?.upcomingOnly) {
      const now = new Date().toISOString().split("T")[0];
      list = list.filter((e) => e.startDate >= now && e.status === "UPCOMING");
    }

    // Sort by event date ascending
    return list.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  async getEventById(id: string): Promise<CampusEvent | null> {
    this.ensureSeeded();
    const list = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    return list.find((e) => e.id === id) || null;
  }

  async getClubEvents(clubId: string): Promise<CampusEvent[]> {
    return this.getEvents({ clubId });
  }

  async getMyEventRegistrations(): Promise<EventRegistration[]> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) return [];
    const all = this.getStorage<EventRegistration[]>(STORAGE_KEYS.EVENT_REGISTRATIONS, []);
    return all.filter((r) => r.userId === user.id && r.status === "CONFIRMED");
  }

  async isRegisteredForEvent(eventId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;
    const regs = await this.getMyEventRegistrations();
    return regs.some((r) => r.eventId === eventId);
  }

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to register for events.");
    }

    const events = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.status !== "UPCOMING" || !event.isRegistrationOpen) {
      throw new Error("Registrations for this event are currently closed.");
    }

    const deadline = new Date(event.registrationDeadline).getTime();
    if (Date.now() > deadline) {
      throw new Error("Registration deadline has passed.");
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      throw new Error("This event has reached full capacity.");
    }

    const registrations = this.getStorage<EventRegistration[]>(STORAGE_KEYS.EVENT_REGISTRATIONS, []);
    const alreadyRegistered = registrations.some(
      (r) => r.eventId === eventId && r.userId === user.id && r.status === "CONFIRMED"
    );
    if (alreadyRegistered) {
      throw new Error("You are already registered for this event.");
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: event.id,
      eventTitle: event.title,
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      userDepartment: user.department,
      registeredAt: new Date().toISOString(),
      status: "CONFIRMED",
    };

    registrations.push(newReg);
    this.setStorage(STORAGE_KEYS.EVENT_REGISTRATIONS, registrations);

    // Increment event registered count
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
    );
    this.setStorage(STORAGE_KEYS.EVENTS, updatedEvents);

    return newReg;
  }

  async cancelEventRegistration(eventId: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to manage registrations.");
    }

    const registrations = this.getStorage<EventRegistration[]>(STORAGE_KEYS.EVENT_REGISTRATIONS, []);
    const existing = registrations.find(
      (r) => r.eventId === eventId && r.userId === user.id && r.status === "CONFIRMED"
    );
    if (!existing) {
      throw new Error("You do not have an active confirmed registration for this event.");
    }

    const updatedRegistrations = registrations.map((r) =>
      r.id === existing.id ? { ...r, status: "CANCELLED" as const } : r
    );
    this.setStorage(STORAGE_KEYS.EVENT_REGISTRATIONS, updatedRegistrations);

    // Decrement event registered count
    const events = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e
    );
    this.setStorage(STORAGE_KEYS.EVENTS, updatedEvents);
  }

  // Admin Event Management
  async createEvent(
    data: Omit<CampusEvent, "id" | "registeredCount" | "createdAt" | "updatedAt">
  ): Promise<CampusEvent> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only an Administrator can create campus events.");
    }

    const events = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const newEvent: CampusEvent = {
      ...data,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    this.setStorage(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CampusEvent>): Promise<CampusEvent> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only an Administrator can update campus events.");
    }

    const events = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Event not found.");

    const updated: CampusEvent = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updated;
    this.setStorage(STORAGE_KEYS.EVENTS, events);
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (user?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only an Administrator can delete campus events.");
    }

    const events = this.getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const filtered = events.filter((e) => e.id !== id);
    this.setStorage(STORAGE_KEYS.EVENTS, filtered);
  }

  // ─── 3. Sports ──────────────────────────────────────────────────────────────

  async getSportsActivities(): Promise<SportsActivity[]> {
    this.ensureSeeded();
    return this.getStorage<SportsActivity[]>(STORAGE_KEYS.SPORTS_ACTIVITIES, SEED_SPORTS_ACTIVITIES);
  }

  async getSportsFacilities(): Promise<SportsFacility[]> {
    this.ensureSeeded();
    return this.getStorage<SportsFacility[]>(STORAGE_KEYS.SPORTS_FACILITIES, SEED_SPORTS_FACILITIES);
  }

  async getSportsTournaments(): Promise<SportsTournament[]> {
    this.ensureSeeded();
    return this.getStorage<SportsTournament[]>(STORAGE_KEYS.SPORTS_TOURNAMENTS, SEED_SPORTS_TOURNAMENTS);
  }

  async getSportsEvents(): Promise<CampusEvent[]> {
    return this.getEvents({ eventType: "SPORTS" });
  }

  // ─── 4. Campus Facilities ───────────────────────────────────────────────────

  async getFacilities(category?: FacilityCategory | "ALL"): Promise<CampusFacility[]> {
    this.ensureSeeded();
    let list = this.getStorage<CampusFacility[]>(STORAGE_KEYS.FACILITIES, SEED_FACILITIES);
    if (category && category !== "ALL") {
      list = list.filter((f) => f.category === category);
    }
    return list;
  }

  async getFacilityById(id: string): Promise<CampusFacility | null> {
    this.ensureSeeded();
    const list = this.getStorage<CampusFacility[]>(STORAGE_KEYS.FACILITIES, SEED_FACILITIES);
    return list.find((f) => f.id === id) || null;
  }

  // ─── 5. Lost & Found (With Safe Contacts & Ownership) ───────────────────────

  async getLostFoundItems(params?: LostFoundFilterParams): Promise<LostFoundItem[]> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    let list = this.getStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      );
    }

    if (params?.type && params.type !== "ALL") {
      list = list.filter((i) => i.type === params.type);
    }

    if (params?.category && params.category !== "ALL") {
      list = list.filter((i) => i.category === params.category);
    }

    if (params?.status && params.status !== "ALL") {
      list = list.filter((i) => i.status === params.status);
    }

    if (params?.myItemsOnly && user) {
      list = list.filter((i) => i.authorId === user.id);
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getLostFoundItemById(id: string): Promise<LostFoundItem | null> {
    this.ensureSeeded();
    const list = this.getStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
    return list.find((i) => i.id === id) || null;
  }

  async createLostFoundItem(
    data: Omit<LostFoundItem, "id" | "authorId" | "authorName" | "authorDepartment" | "createdAt" | "updatedAt">
  ): Promise<LostFoundItem> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to report a lost or found item.");
    }

    const items = this.getStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
    const newItem: LostFoundItem = {
      ...data,
      id: `lf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorId: user.id,
      authorName: user.fullName || user.username,
      authorDepartment: user.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    this.setStorage(STORAGE_KEYS.LOST_FOUND, items);
    return newItem;
  }

  async updateLostFoundItem(id: string, updates: Partial<LostFoundItem>): Promise<LostFoundItem> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required.");

    const items = this.getStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Item not found.");

    const item = items[index];
    if (item.authorId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only edit your own Lost & Found reports.");
    }

    const updated: LostFoundItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this.setStorage(STORAGE_KEYS.LOST_FOUND, items);
    return updated;
  }

  async resolveLostFoundItem(id: string): Promise<LostFoundItem> {
    return this.updateLostFoundItem(id, { status: "RESOLVED" });
  }

  async deleteLostFoundItem(id: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required.");

    const items = this.getStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error("Item not found.");

    if (item.authorId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only delete your own Lost & Found reports.");
    }

    const filtered = items.filter((i) => i.id !== id);
    this.setStorage(STORAGE_KEYS.LOST_FOUND, filtered);
  }

  // ─── 6. Campus Marketplace ──────────────────────────────────────────────────

  async getMarketplaceListings(params?: MarketplaceFilterParams): Promise<MarketplaceListing[]> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    let list = this.getStorage<MarketplaceListing[]>(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.sellerName.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== "ALL") {
      list = list.filter((l) => l.category === params.category);
    }

    if (params?.condition && params.condition !== "ALL") {
      list = list.filter((l) => l.condition === params.condition);
    }

    if (params?.status && params.status !== "ALL") {
      list = list.filter((l) => l.status === params.status);
    }

    if (params?.minPrice !== undefined) {
      list = list.filter((l) => l.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      list = list.filter((l) => l.price <= params.maxPrice!);
    }

    if (params?.myListingsOnly && user) {
      list = list.filter((l) => l.sellerId === user.id);
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getMarketplaceListingById(id: string): Promise<MarketplaceListing | null> {
    this.ensureSeeded();
    const list = this.getStorage<MarketplaceListing[]>(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);
    return list.find((l) => l.id === id) || null;
  }

  async createMarketplaceListing(
    data: Omit<MarketplaceListing, "id" | "sellerId" | "sellerName" | "sellerDepartment" | "createdAt" | "updatedAt">
  ): Promise<MarketplaceListing> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to create a marketplace listing.");
    }

    const listings = this.getStorage<MarketplaceListing[]>(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);
    const newListing: MarketplaceListing = {
      ...data,
      id: `mkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sellerId: user.id,
      sellerName: user.fullName || user.username,
      sellerDepartment: user.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    listings.unshift(newListing);
    this.setStorage(STORAGE_KEYS.MARKETPLACE, listings);
    return newListing;
  }

  async updateMarketplaceListing(
    id: string,
    updates: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required.");

    const listings = this.getStorage<MarketplaceListing[]>(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) throw new Error("Listing not found.");

    const listing = listings[index];
    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only edit your own marketplace listings.");
    }

    const updated: MarketplaceListing = {
      ...listing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    listings[index] = updated;
    this.setStorage(STORAGE_KEYS.MARKETPLACE, listings);
    return updated;
  }

  async markListingSold(id: string): Promise<MarketplaceListing> {
    return this.updateMarketplaceListing(id, { status: "SOLD" });
  }

  async deleteMarketplaceListing(id: string): Promise<void> {
    this.ensureSeeded();
    const user = this.getCurrentUser();
    if (!user) throw new Error("Authentication required.");

    const listings = this.getStorage<MarketplaceListing[]>(STORAGE_KEYS.MARKETPLACE, SEED_MARKETPLACE);
    const listing = listings.find((l) => l.id === id);
    if (!listing) throw new Error("Listing not found.");

    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized: You can only delete your own marketplace listings.");
    }

    const filtered = listings.filter((l) => l.id !== id);
    this.setStorage(STORAGE_KEYS.MARKETPLACE, filtered);
  }

  // ─── 7. Transport ───────────────────────────────────────────────────────────

  async getTransportRoutes(): Promise<TransportRoute[]> {
    this.ensureSeeded();
    return this.getStorage<TransportRoute[]>(STORAGE_KEYS.TRANSPORT, SEED_TRANSPORT);
  }

  async getTransportRouteById(id: string): Promise<TransportRoute | null> {
    this.ensureSeeded();
    const routes = this.getStorage<TransportRoute[]>(STORAGE_KEYS.TRANSPORT, SEED_TRANSPORT);
    return routes.find((r) => r.id === id) || null;
  }

  // ─── 8. Hostel ──────────────────────────────────────────────────────────────

  async getHostelInfo(): Promise<HostelInfo> {
    this.ensureSeeded();
    return this.getStorage<HostelInfo>(STORAGE_KEYS.HOSTEL, SEED_HOSTEL_INFO);
  }

  // ─── 9. Campus Directory ────────────────────────────────────────────────────

  async getDirectoryEntries(
    category?: DirectoryCategory | "ALL",
    search?: string
  ): Promise<CampusDirectoryEntry[]> {
    this.ensureSeeded();
    let list = this.getStorage<CampusDirectoryEntry[]>(STORAGE_KEYS.DIRECTORY, SEED_DIRECTORY);

    if (category && category !== "ALL") {
      list = list.filter((d) => d.category === category);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.officeName.toLowerCase().includes(q) ||
          d.headName.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.servicesProvided.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }
}

export const mockCampusLifeService = new MockCampusLifeService();
export const campusLifeService: ICampusLifeService = mockCampusLifeService;
