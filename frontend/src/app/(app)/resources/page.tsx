import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { BookOpen } from "lucide-react";
export const metadata: Metadata = { title: "Academic Resources" };
export default function ResourcesPage() {
  return <ModulePlaceholder title="Academic Resources" description="Notes, papers, lab manuals and study groups — coming in Phase 4." icon={<BookOpen className="h-8 w-8 text-[var(--cn-emerald)]" />} phase="Phase 4" />;
}
