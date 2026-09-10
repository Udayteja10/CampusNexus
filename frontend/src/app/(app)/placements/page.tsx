import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Briefcase } from "lucide-react";
export const metadata: Metadata = { title: "Placements" };
export default function PlacementsPage() {
  return <ModulePlaceholder title="Placements" description="Placement experiences, packages and company insights — coming in Phase 5." icon={<Briefcase className="h-8 w-8 text-[var(--cn-amber)]" />} phase="Phase 5" />;
}
