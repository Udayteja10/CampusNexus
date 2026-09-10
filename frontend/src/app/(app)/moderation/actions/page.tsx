import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Shield } from "lucide-react";
export const metadata: Metadata = { title: "Moderation Actions" };
export default function ModActionsPage() {
  return <ModulePlaceholder title="Moderation — Actions" description="Bans, warns and content removals — coming in Phase 8." icon={<Shield className="h-8 w-8 text-[var(--cn-amber)]" />} phase="Phase 8" />;
}
