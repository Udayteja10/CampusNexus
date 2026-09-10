import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Flag } from "lucide-react";
export const metadata: Metadata = { title: "Moderation Reports" };
export default function ModReportsPage() {
  return <ModulePlaceholder title="Moderation — Reports" description="Review and action user reports — coming in Phase 8." icon={<Flag className="h-8 w-8 text-[var(--cn-amber)]" />} phase="Phase 8" />;
}
