/**
 * CampusNexus — Help & Support Seed Data
 * Phase 9 FAQs and Demo Support Requests
 */

import { FAQ, HelpCategoryMeta, SupportRequest } from "@/types/help.types";

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  {
    id: "ACCOUNT",
    label: "Account & Login",
    description: "Registration, institutional email verification, login credentials, and profile settings.",
    iconName: "UserCheck",
  },
  {
    id: "ACADEMIC",
    label: "Academic Hub",
    description: "Subjects, study materials, student study groups, academic calendar, and faculty reviews.",
    iconName: "BookOpen",
  },
  {
    id: "COMMUNITY",
    label: "Campus Community",
    description: "Discussions, posts, channels, anonymous posting, commenting, and content reporting.",
    iconName: "MessagesSquare",
  },
  {
    id: "CAREER",
    label: "Career & Placements",
    description: "Placement drives, internship openings, eligibility checks, applications, and resume reviews.",
    iconName: "Briefcase",
  },
  {
    id: "CAMPUS_LIFE",
    label: "Campus Life",
    description: "Clubs & societies, events, lost & found registry, marketplace, hostel, and transport.",
    iconName: "Sparkles",
  },
  {
    id: "SEARCH",
    label: "Global Search",
    description: "CampusNexus unified content search, module filtering, search query operators, and shortcuts.",
    iconName: "Search",
  },
  {
    id: "PRIVACY_SAFETY",
    label: "Privacy & Safety",
    description: "Anonymous-first student protections, identity safety, moderation guidelines, and data policies.",
    iconName: "ShieldCheck",
  },
  {
    id: "TECHNICAL",
    label: "Technical Support",
    description: "Browser issues, offline caching, mobile responsiveness, and client performance.",
    iconName: "Cpu",
  },
  {
    id: "GENERAL",
    label: "General Platform",
    description: "CampusNexus platform overview, policies, and navigation help.",
    iconName: "HelpCircle",
  },
];

export const INITIAL_FAQS: FAQ[] = [
  // ─── Account & Login ──────────────────────────────────────────────
  {
    id: "faq-acc-01",
    slug: "how-to-create-account",
    question: "How do I create a CampusNexus account?",
    answer:
      "To register for CampusNexus, click on 'Sign Up' on the login page and use your official college email address (@mlrit.ac.in). Choose your academic department, entry batch, and set a secure password. Once submitted, you will receive a verification prompt to confirm your institutional affiliation.",
    category: "ACCOUNT",
    keywords: ["register", "sign up", "new account", "email", "institutional email", "student account"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "faq-acc-02",
    slug: "forgot-password-recovery",
    question: "I forgot my password. How can I reset it?",
    answer:
      "On the login page, click 'Forgot Password?'. Enter your registered institutional email address. You will receive password recovery instructions and a secure reset link to create a new password.",
    category: "ACCOUNT",
    keywords: ["password reset", "forgot password", "recover account", "login help"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "faq-acc-03",
    slug: "how-to-update-profile",
    question: "How do I update my bio, department, or display name?",
    answer:
      "Navigate to your profile by clicking your avatar in the top right menu and selecting 'Profile'. On your profile page, click the 'Edit Profile' button to update your full name, bio (up to 300 characters), department, and batch details.",
    category: "ACCOUNT",
    keywords: ["edit profile", "bio", "full name", "batch", "department", "avatar"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },

  // ─── Academic Hub ────────────────────────────────────────────────
  {
    id: "faq-acad-01",
    slug: "how-to-upload-academic-resource",
    question: "How do I upload and share study materials or previous question papers?",
    answer:
      "Visit the Academic Resources section (/academic/resources) and click 'Upload Resource'. Select the relevant subject, semester, resource type (Notes, Question Paper, Syllabus, Lab Manual), enter a clear title and description, and attach the resource link or document.",
    category: "ACADEMIC",
    keywords: ["academic resources", "upload notes", "previous papers", "study material", "pyqs"],
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "faq-acad-02",
    slug: "how-to-join-study-group",
    question: "How do study groups work and how do I join or create one?",
    answer:
      "Study groups allow students to collaborate on specific subjects or project topics. Go to Academic -> Study Groups (/academic/study-groups). You can browse existing public study groups by subject and click 'Join Group'. To create your own, click 'Create Study Group' and invite classmates.",
    category: "ACADEMIC",
    keywords: ["study groups", "peer learning", "group study", "collaboration", "academic"],
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "faq-acad-03",
    slug: "how-faculty-reviews-work",
    question: "How do faculty reviews work and are they anonymous?",
    answer:
      "Faculty profiles allow students to share feedback regarding course delivery, teaching methodology, and subject guidance. All faculty reviews submitted with the 'Post Anonymously' toggle are strictly anonymous — your student name, email, and ID are never shown to faculty, moderators, or other students.",
    category: "ACADEMIC",
    keywords: ["faculty review", "anonymous review", "teacher feedback", "ratings", "professors"],
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },

  // ─── Campus Community ────────────────────────────────────────────
  {
    id: "faq-comm-01",
    slug: "can-i-post-anonymously",
    question: "Can I post anonymously in the Community feed?",
    answer:
      "Yes! When creating a new discussion post or comment in the Community, you can toggle 'Post Anonymously'. When enabled, your post will display as 'Anonymous Student' with a neutral avatar. Anonymous posts are also strictly excluded from your public profile activity feed to safeguard your identity.",
    category: "COMMUNITY",
    keywords: ["anonymous post", "privacy", "anonymous student", "community post", "confessions"],
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
  },
  {
    id: "faq-comm-02",
    slug: "how-to-report-inappropriate-content",
    question: "How do I report a post, comment, or policy violation?",
    answer:
      "Every community post and comment features a three-dot menu with a 'Report' option. Clicking 'Report' allows you to select a violation category (e.g. Harassment, Spam, Academic Dishonesty, Inappropriate Content) and provide context. Reports are immediately routed to campus moderators.",
    category: "COMMUNITY",
    keywords: ["report post", "flag content", "moderation", "harassment", "spam", "safety"],
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
  },

  // ─── Career & Placements ─────────────────────────────────────────
  {
    id: "faq-car-01",
    slug: "how-to-apply-for-placement-drives",
    question: "How do I apply for on-campus placements and internship drives?",
    answer:
      "Head to the Career module (/career). You can explore active placement drives (/career/placements) and summer internship openings (/career/internships). Opportunities display automated eligibility checks based on your branch, CGPA, and backlog criteria. Click on an opportunity and submit your application with a single click.",
    category: "CAREER",
    keywords: ["placement", "internship", "job drive", "eligibility", "campus placement", "ctc"],
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },
  {
    id: "faq-car-02",
    slug: "how-to-request-resume-review",
    question: "How do I request a peer or mentor resume review?",
    answer:
      "In the Career module, navigate to 'Resume Review' (/career/resume-review). Click 'Request Review', specify your target job roles, upload your resume PDF link, and submit. Senior mentors and student coordinators will review your resume and provide actionable suggestions.",
    category: "CAREER",
    keywords: ["resume review", "cv feedback", "mentor review", "career guidance"],
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },

  // ─── Campus Life ─────────────────────────────────────────────────
  {
    id: "faq-life-01",
    slug: "how-to-join-a-campus-club",
    question: "How do I join a student club or society?",
    answer:
      "Browse the student club directory at /campus-life/clubs. Click on any club to view its vision, active leaders, upcoming events, and recruitment status. Click 'Join Club' to become a registered member and receive club updates.",
    category: "CAMPUS_LIFE",
    keywords: ["clubs", "societies", "student bodies", "extracurricular", "join club"],
    createdAt: "2024-01-19T12:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
  },
  {
    id: "faq-life-02",
    slug: "how-to-report-lost-or-found-item",
    question: "How do I report a lost or found item on campus?",
    answer:
      "Go to Campus Life -> Lost & Found (/campus-life/lost-found). Click 'Report Item', select whether it is 'LOST' or 'FOUND', specify the campus location (e.g. Library, Lab 304, Sports Complex), category, description, and contact info.",
    category: "CAMPUS_LIFE",
    keywords: ["lost and found", "lost item", "found item", "campus recovery"],
    createdAt: "2024-01-19T12:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
  },
  {
    id: "faq-life-03",
    slug: "how-marketplace-works",
    question: "How does the student peer marketplace work?",
    answer:
      "The student marketplace (/campus-life/marketplace) lets students buy, sell, or donate secondhand academic books, calculators, electronics, and lab gear directly to fellow campus peers. Click 'Create Listing' to post an item with photos, condition rating, and pricing.",
    category: "CAMPUS_LIFE",
    keywords: ["marketplace", "buy books", "sell calculator", "second hand", "peer exchange"],
    createdAt: "2024-01-19T12:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
  },

  // ─── Global Search ───────────────────────────────────────────────
  {
    id: "faq-search-01",
    slug: "how-to-use-global-search",
    question: "How does Global Search work and what can I find?",
    answer:
      "Global Search (/search or pressing Ctrl+K / Cmd+K from anywhere in the app) searches across all CampusNexus modules simultaneously: Community discussions, Academic subjects, resources, study groups, faculty profiles, Career placement & internship opportunities, Campus Life events, clubs, marketplace listings, and lost & found reports.",
    category: "SEARCH",
    keywords: ["global search", "quick search", "cmd k", "find content", "search filters"],
    createdAt: "2024-01-20T13:00:00Z",
    updatedAt: "2024-01-20T13:00:00Z",
  },
  {
    id: "faq-search-02",
    slug: "are-student-profiles-searchable",
    question: "Are student names and personal profiles searchable in Global Search?",
    answer:
      "No. To protect student privacy, student profiles and personal directory information are NOT indexed or searchable in Global Search. Search is exclusively focused on campus content and public faculty resources.",
    category: "SEARCH",
    keywords: ["privacy", "student search", "people search", "directory", "profile privacy"],
    createdAt: "2024-01-20T13:00:00Z",
    updatedAt: "2024-01-20T13:00:00Z",
  },

  // ─── Privacy & Safety ────────────────────────────────────────────
  {
    id: "faq-priv-01",
    slug: "privacy-policy-overview",
    question: "How does CampusNexus protect student data and privacy?",
    answer:
      "CampusNexus adheres to an anonymous-first privacy model. Sensitive student identifiers (like internal IDs, authentication tokens, and private contact info) are strictly encapsulated. Anonymous posts and reviews are never linked to student profiles.",
    category: "PRIVACY_SAFETY",
    keywords: ["privacy", "data safety", "anonymity", "security policy"],
    createdAt: "2024-01-21T14:00:00Z",
    updatedAt: "2024-01-21T14:00:00Z",
  },

  // ─── Technical Support ───────────────────────────────────────────
  {
    id: "faq-tech-01",
    slug: "troubleshooting-page-load-issues",
    question: "What should I do if a page fails to load or shows stale data?",
    answer:
      "CampusNexus uses modern client-side caching. If you experience unexpected display issues, try doing a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or clear your browser's local application cache. If the issue persists, submit a support request with the page URL.",
    category: "TECHNICAL",
    keywords: ["technical issue", "cache", "slow load", "refresh", "bug report"],
    createdAt: "2024-01-22T15:00:00Z",
    updatedAt: "2024-01-22T15:00:00Z",
  },

  // ─── General Platform ────────────────────────────────────────────
  {
    id: "faq-gen-01",
    slug: "what-is-campusnexus",
    question: "What is CampusNexus?",
    answer:
      "CampusNexus is the unified campus life, academic collaboration, and career preparation platform designed for engineering students, faculty, and campus administrators.",
    category: "GENERAL",
    keywords: ["campusnexus", "overview", "about", "platform"],
    createdAt: "2024-01-23T16:00:00Z",
    updatedAt: "2024-01-23T16:00:00Z",
  },
];

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "req-101",
    userId: "mock-student-001",
    userFullName: "Alex Johnson",
    userEmail: "student@mlrit.ac.in",
    subject: "Unable to download Lab Manual for Operating Systems",
    description:
      "When clicking on the download link for OS Lab Manual Unit 3 in Academic Resources, the link returns a 404 response. Could you please check if the link needs to be updated?",
    category: "ACADEMIC",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    relatedRoute: "/academic/resources",
    createdAt: "2024-02-10T11:30:00Z",
    updatedAt: "2024-02-11T09:15:00Z",
    messages: [
      {
        id: "msg-101-1",
        authorId: "mock-student-001",
        authorName: "Alex Johnson",
        isStaff: false,
        content: "Attached note: I tried downloading on both Chrome and Firefox.",
        createdAt: "2024-02-10T11:30:00Z",
      },
      {
        id: "msg-101-2",
        authorId: "support-staff-01",
        authorName: "Academic Support Team",
        isStaff: true,
        content: "Thank you for reporting this. We have contacted the department coordinator to re-verify the uploaded file resource.",
        createdAt: "2024-02-11T09:15:00Z",
      },
    ],
  },
  {
    id: "req-102",
    userId: "mock-student-001",
    userFullName: "Alex Johnson",
    userEmail: "student@mlrit.ac.in",
    subject: "Eligibility criteria query for Infosys Placement Drive",
    description:
      "My profile reflects 0 backlogs, but the system shows an eligibility discrepancy on the Infosys specialist drive card. Please verify my academic record status.",
    category: "CAREER",
    priority: "HIGH",
    status: "OPEN",
    relatedRoute: "/career/placements",
    createdAt: "2024-02-14T14:20:00Z",
    updatedAt: "2024-02-14T14:20:00Z",
    messages: [
      {
        id: "msg-102-1",
        authorId: "mock-student-001",
        authorName: "Alex Johnson",
        isStaff: false,
        content: "I have submitted my 6th sem marksheet to the placement cell last week.",
        createdAt: "2024-02-14T14:20:00Z",
      },
    ],
  },
  {
    id: "req-103",
    userId: "mock-student-001",
    userFullName: "Alex Johnson",
    userEmail: "student@mlrit.ac.in",
    subject: "Question about Hackathon Event Registration",
    description:
      "Wanted to confirm if team members from different departments can register together for the upcoming Annual Hackathon.",
    category: "CAMPUS_LIFE",
    priority: "LOW",
    status: "RESOLVED",
    relatedRoute: "/campus-life/events",
    createdAt: "2024-01-28T16:00:00Z",
    updatedAt: "2024-01-29T10:00:00Z",
    messages: [
      {
        id: "msg-103-1",
        authorId: "mock-student-001",
        authorName: "Alex Johnson",
        isStaff: false,
        content: "Specifically looking to form a team of CSE + ECE students.",
        createdAt: "2024-01-28T16:00:00Z",
      },
      {
        id: "msg-103-2",
        authorId: "support-staff-02",
        authorName: "Campus Life Coordinator",
        isStaff: true,
        content: "Yes, cross-department teams are fully permitted for all open hackathon tracks.",
        createdAt: "2024-01-29T10:00:00Z",
      },
    ],
  },
];
