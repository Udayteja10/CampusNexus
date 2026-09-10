import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Building2 } from "lucide-react";
export const metadata: Metadata = { title: "Clubs" };
export default function ClubsPage() {
  return <ModulePlaceholder title="Clubs" description="Discover and join campus clubs and societies — coming in Phase 5." icon={<Building2 className="h-8 w-8 text-[var(--cn-rose)]" />} phase="Phase 5" />;
}
