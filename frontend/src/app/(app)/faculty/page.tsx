import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Users } from "lucide-react";
export const metadata: Metadata = { title: "Faculty" };
export default function FacultyPage() {
  return <ModulePlaceholder title="Faculty Profiles" description="Browse department faculty, subjects and ratings — coming in Phase 4." icon={<Users className="h-8 w-8 text-[var(--cn-sky)]" />} phase="Phase 4" />;
}
