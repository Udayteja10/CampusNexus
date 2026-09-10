import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Star } from "lucide-react";
export const metadata: Metadata = { title: "Internships" };
export default function InternshipsPage() {
  return <ModulePlaceholder title="Internships" description="Internship listings and experiences shared by peers — coming in Phase 5." icon={<Star className="h-8 w-8 text-[var(--cn-amber)]" />} phase="Phase 5" />;
}
