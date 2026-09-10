import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Search } from "lucide-react";
export const metadata: Metadata = { title: "Search" };
export default function SearchPage() {
  return <ModulePlaceholder title="Global Search" description="Search across all CampusNexus content — coming in Phase 3." icon={<Search className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 3" />;
}
