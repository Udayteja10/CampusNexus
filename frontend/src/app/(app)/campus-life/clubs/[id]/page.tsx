"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Share2,
  Sparkles,
  ArrowLeft,
  Megaphone,
  Image as ImageIcon,
  Trophy,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  CalendarDays,
  X,
  PlusCircle,
  Tag,
  Globe,
  Camera,
  Award,
} from "lucide-react";
import type {
  Club,
  ClubAnnouncement,
  ClubEvent,
  ClubGalleryItem,
  ClubAchievement,
} from "@/types/campusLife.types";
import { clubsApi } from "@/lib/campusLifeApi";
import { useAuthStore } from "@/store/auth.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ClubDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [club, setClub] = useState<Club | null>(null);
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [gallery, setGallery] = useState<ClubGalleryItem[]>([]);
  const [achievements, setAchievements] = useState<ClubAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "announcements" | "events" | "gallery" | "achievements">("overview");

  // Authorization checks
  const isAdmin = user?.role === "ADMIN";
  const isPresident = club?.currentPresident?.userId === user?.id;
  const isClubActive = club?.status === "ACTIVE";
  const canManage = (club?.canManage ?? (isAdmin || isPresident)) && (isClubActive || isAdmin);

  // Modals for Club Managers (Admin or President)
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceContent, setAnnounceContent] = useState("");

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    venue: "",
    startDateTime: "",
    endDateTime: "",
    registrationLink: "",
    imageUrl: "",
  });

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
    caption: "",
  });

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    description: "",
    achievementDate: "",
    imageUrl: "",
  });

  const clubIdNum = parseInt(id, 10);

  const loadClubData = async () => {
    if (isNaN(clubIdNum)) {
      router.push("/campus-life/clubs");
      return;
    }
    setLoading(true);
    try {
      const [clubData, annData, evData, galData, achData] = await Promise.all([
        clubsApi.getClubById(clubIdNum),
        clubsApi.getAnnouncements(clubIdNum),
        clubsApi.getEvents(clubIdNum),
        clubsApi.getGallery(clubIdNum),
        clubsApi.getAchievements(clubIdNum),
      ]);
      setClub(clubData);
      setAnnouncements(annData);
      setEvents(evData);
      setGallery(galData);
      setAchievements(achData);
    } catch (err: any) {
      console.error("Failed to load club details:", err);
      toast.error(err.response?.data?.message || "Failed to load club details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubData();
  }, [id]);

  // Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) {
      toast.error("Please fill in title and content");
      return;
    }
    try {
      await clubsApi.createAnnouncement(clubIdNum, {
        title: announceTitle.trim(),
        content: announceContent.trim(),
      });
      toast.success("Announcement posted successfully!");
      setAnnounceTitle("");
      setAnnounceContent("");
      setIsAnnounceModalOpen(false);
      const updated = await clubsApi.getAnnouncements(clubIdNum);
      setAnnouncements(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (annId: number) => {
    try {
      await clubsApi.deleteAnnouncement(clubIdNum, annId);
      toast.success("Announcement deleted");
      setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.startDateTime || !eventForm.endDateTime) {
      toast.error("Title, start time, and end time are required");
      return;
    }
    try {
      await clubsApi.createEvent(clubIdNum, {
        title: eventForm.title,
        description: eventForm.description,
        venue: eventForm.venue,
        startDateTime: eventForm.startDateTime,
        endDateTime: eventForm.endDateTime,
        registrationLink: eventForm.registrationLink || undefined,
        imageUrl: eventForm.imageUrl || undefined,
      });
      toast.success("Event created successfully!");
      setIsEventModalOpen(false);
      setEventForm({
        title: "",
        description: "",
        venue: "",
        startDateTime: "",
        endDateTime: "",
        registrationLink: "",
        imageUrl: "",
      });
      const updated = await clubsApi.getEvents(clubIdNum);
      setEvents(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (evId: number) => {
    try {
      await clubsApi.deleteEvent(clubIdNum, evId);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e.id !== evId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }
    try {
      await clubsApi.addGalleryItem(clubIdNum, {
        imageUrl: galleryForm.imageUrl.trim(),
        caption: galleryForm.caption.trim() || undefined,
      });
      toast.success("Photo added to gallery!");
      setIsGalleryModalOpen(false);
      setGalleryForm({ imageUrl: "", caption: "" });
      const updated = await clubsApi.getGallery(clubIdNum);
      setGallery(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add photo");
    }
  };

  const handleDeleteGalleryItem = async (photoId: number) => {
    try {
      await clubsApi.deleteGalleryItem(clubIdNum, photoId);
      toast.success("Photo removed");
      setGallery((prev) => prev.filter((g) => g.id !== photoId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title.trim() || !achievementForm.achievementDate) {
      toast.error("Title and date are required");
      return;
    }
    try {
      await clubsApi.addAchievement(clubIdNum, {
        title: achievementForm.title.trim(),
        description: achievementForm.description.trim() || undefined,
        achievementDate: achievementForm.achievementDate,
        imageUrl: achievementForm.imageUrl.trim() || undefined,
      });
      toast.success("Achievement added!");
      setIsAchievementModalOpen(false);
      setAchievementForm({ title: "", description: "", achievementDate: "", imageUrl: "" });
      const updated = await clubsApi.getAchievements(clubIdNum);
      setAchievements(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add achievement");
    }
  };

  const handleDeleteAchievement = async (achId: number) => {
    try {
      await clubsApi.deleteAchievement(clubIdNum, achId);
      toast.success("Achievement deleted");
      setAchievements((prev) => prev.filter((a) => a.id !== achId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 md:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">Club Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested club could not be loaded.</p>
        <Link href="/campus-life/clubs" className={`mt-4 inline-flex items-center ${buttonVariants({ variant: "default" })}`}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Back button & Role Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/campus-life/clubs"
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Clubs
        </Link>

        {/* Status / Role Indicator Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <Link href="/admin/clubs">
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 text-xs gap-1 cursor-pointer">
                <span>🛡️ Admin Controls</span>
              </Badge>
            </Link>
          )}
          {isPresident && !isAdmin && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-1 px-3 text-xs gap-1">
              <span>👑 President Controls</span>
            </Badge>
          )}
          {club.status === "INACTIVE" && (
            <Badge variant="destructive" className="py-1 px-3 text-xs">
              Deactivated Club
            </Badge>
          )}
        </div>
      </div>

      {/* Leadership Alert for Authorized Users */}
      {isAdmin && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Global Administrator Controls Active</h4>
              <p className="text-xs text-muted-foreground">
                You have unrestricted administrative authority to manage club content, settings, and assign student presidents.
              </p>
            </div>
          </div>
          <Link href="/admin/clubs">
            <Button size="sm" variant="outline" className="text-xs whitespace-nowrap border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              Manage Club in Admin
            </Button>
          </Link>
        </div>
      )}

      {isPresident && !isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Club President Leadership Enabled</h4>
            <p className="text-xs text-muted-foreground">
              You are the designated Student President for {club.name}. You can post announcements, schedule events, add gallery memories, and record achievements.
            </p>
          </div>
        </div>
      )}

      {/* Inactive club warning */}
      {club.status === "INACTIVE" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-destructive/20 text-destructive">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-destructive">Club Deactivated</h4>
            <p className="text-xs text-muted-foreground">
              This club is currently inactive. New announcements, events, photos, and achievements cannot be published until reactivated by an administrator.
            </p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-card shadow-sm">
        {/* Cover banner */}
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 relative">
          {club.coverUrl && (
            <img
              src={club.coverUrl}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Club Details Overlay */}
        <div className="p-6 md:p-8 -mt-16 md:-mt-20 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            {club.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-background shadow-md bg-background"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/20 border-4 border-background shadow-md flex items-center justify-center font-bold text-3xl text-primary">
                {club.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/30 text-primary font-semibold">
                  {club.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    club.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }
                >
                  {club.status}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {club.name}
              </h1>
              {club.contactEmail && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary/70" /> {club.contactEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-1 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Info className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "announcements"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Megaphone className="w-4 h-4" /> Announcements
          {announcements.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-background/20 font-bold">
              {announcements.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "events"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Events
          {events.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-background/20 font-bold">
              {events.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "gallery"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Gallery
          {gallery.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-background/20 font-bold">
              {gallery.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "achievements"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Trophy className="w-4 h-4" /> Achievements
          {achievements.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-background/20 font-bold">
              {achievements.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {/* 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">About {club.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {club.description || "No description provided for this club."}
                </p>
              </CardContent>
            </Card>

            {/* Quick Latest Announcements */}
            {announcements.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Recent Announcement</CardTitle>
                    <CardDescription>Latest update from the club</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("announcements")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground">{announcements[0].title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {announcements[0].content}
                    </p>
                    <p className="text-xs text-primary/70 mt-2">
                      Posted on {new Date(announcements[0].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Club Leadership / President Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-amber-500">👑</span>
                  <span>Club Leadership</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.currentPresident ? (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {club.currentPresident.designation}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {club.currentPresident.fullName || club.currentPresident.username}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        @{club.currentPresident.username}
                        {club.currentPresident.htno && ` • ${club.currentPresident.htno}`}
                      </p>
                      {club.currentPresident.email && (
                        <p className="text-xs text-primary/80 mt-1">
                          {club.currentPresident.email}
                        </p>
                      )}
                    </div>
                    {club.currentPresident.assignedAt && (
                      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        Appointed on {new Date(club.currentPresident.assignedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border text-center space-y-1">
                    <p className="text-xs text-muted-foreground">No active president assigned.</p>
                    {isAdmin && (
                      <Link href="/admin/clubs">
                        <Button size="sm" variant="link" className="text-xs p-0 text-primary">
                          Assign President
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Club Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{club.category}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Status</span>
                  <span className={club.status === "ACTIVE" ? "font-medium text-emerald-600 dark:text-emerald-400" : "font-medium text-destructive"}>
                    {club.status}
                  </span>
                </div>
                {club.contactEmail && (
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Contact</span>
                    <a href={`mailto:${club.contactEmail}`} className="text-primary hover:underline text-xs">
                      {club.contactEmail}
                    </a>
                  </div>
                )}
                {club.socialLinks && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Links</span>
                    <a href={club.socialLinks} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                      <Globe className="w-3.5 h-3.5" /> Visit Link
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Club Announcements</h2>
              <p className="text-sm text-muted-foreground">Important updates and notices</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsAnnounceModalOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" /> Post Announcement
              </Button>
            )}
          </div>

          {announcements.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              <Megaphone className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p>No announcements posted yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <Card key={ann.id} className="border-border/60 hover:shadow-sm transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{ann.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Posted on {new Date(ann.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-foreground/80 mt-3 text-sm whitespace-pre-line leading-relaxed">
                      {ann.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. EVENTS */}
      {activeTab === "events" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Club Events</h2>
              <p className="text-sm text-muted-foreground">Upcoming and ongoing activities organized by {club.name}</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsEventModalOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" /> Add Event
              </Button>
            )}
          </div>

          {events.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p>No events scheduled currently.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {events.map((evt) => (
                <Card key={evt.id} className="border-border/60 overflow-hidden flex flex-col justify-between">
                  <div>
                    {evt.imageUrl && (
                      <div className="h-44 w-full overflow-hidden bg-muted">
                        <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{evt.title}</CardTitle>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{new Date(evt.startDateTime).toLocaleString()} - {new Date(evt.endDateTime).toLocaleString()}</span>
                        </div>
                        {evt.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span>{evt.venue}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {evt.description && (
                      <CardContent className="px-5 pb-4 text-sm text-foreground/80">
                        <p className="line-clamp-3">{evt.description}</p>
                      </CardContent>
                    )}
                  </div>
                  {evt.registrationLink && (
                    <div className="p-5 pt-0">
                      <a
                        href={evt.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full gap-2 ${buttonVariants({ variant: "outline", size: "sm" })}`}
                      >
                        Register / More Info <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Club Gallery</h2>
              <p className="text-sm text-muted-foreground">Photos and memories from past activities</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsGalleryModalOpen(true)} className="gap-2">
                <Camera className="w-4 h-4" /> Add Photo
              </Button>
            )}
          </div>

          {gallery.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p>No photos in the gallery yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((photo) => (
                <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-border/60 aspect-video bg-muted">
                  <img src={photo.imageUrl} alt={photo.caption || "Club Photo"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs">
                      {photo.caption}
                    </div>
                  )}
                  {canManage && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteGalleryItem(photo.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Club Achievements</h2>
              <p className="text-sm text-muted-foreground">Awards, recognitions, and milestones</p>
            </div>
            {canManage && (
              <Button onClick={() => setIsAchievementModalOpen(true)} className="gap-2">
                <Award className="w-4 h-4" /> Add Achievement
              </Button>
            )}
          </div>

          {achievements.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p>No achievements recorded yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <Card key={ach.id} className="border-border/60">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground">{ach.title}</h4>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAchievement(ach.id)}
                            className="text-destructive hover:bg-destructive/10 -mr-2 -mt-1 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Achieved on {new Date(ach.achievementDate).toLocaleDateString()}
                      </p>
                      {ach.description && (
                        <p className="text-sm text-foreground/80 pt-1 leading-relaxed">
                          {ach.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS FOR STAFF */}
      {/* 1. Announcement Modal */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Post Announcement</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAnnounceModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Title *</label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Workshop Registration Open"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Content *</label>
                <textarea
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Write the announcement details..."
                  rows={4}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAnnounceModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Post</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Create Club Event</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsEventModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Hackathon 2026"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDateTime}
                    onChange={(e) => setEventForm({ ...eventForm, startDateTime: e.target.value })}
                    required
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDateTime}
                    onChange={(e) => setEventForm({ ...eventForm, endDateTime: e.target.value })}
                    required
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Venue</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  placeholder="e.g. Auditorium Hall B"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Details about the event..."
                  rows={3}
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Registration Link (URL)</label>
                <input
                  type="url"
                  value={eventForm.registrationLink}
                  onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Banner Image URL</label>
                <input
                  type="url"
                  value={eventForm.imageUrl}
                  onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Gallery Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Add Photo to Gallery</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsGalleryModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAddGalleryItem} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Image URL *</label>
                <input
                  type="url"
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Caption</label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  placeholder="e.g. Annual Fest 2026 performance"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsGalleryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Photo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Achievement Modal */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Add Achievement</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAchievementModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Achievement Title *</label>
                <input
                  type="text"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  placeholder="e.g. 1st Place at National Hackathon"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Achievement Date *</label>
                <input
                  type="date"
                  value={achievementForm.achievementDate}
                  onChange={(e) => setAchievementForm({ ...achievementForm, achievementDate: e.target.value })}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  placeholder="Details about the prize or recognition..."
                  rows={3}
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAchievementModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Achievement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
