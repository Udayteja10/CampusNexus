import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Search } from "lucide-react";
export const metadata: Metadata = { title: "Lost & Found" };
export default function LostFoundPage() {
  return <ModulePlaceholder title="Lost & Found" description="Report and recover lost items on campus — coming in Phase 6." icon={<Search className="h-8 w-8 text-[var(--cn-sky)]" />} phase="Phase 6" />;
}
