import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Settings } from "lucide-react";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() {
  return <ModulePlaceholder title="Settings" description="Manage your account, privacy and notification preferences — coming in Phase 7." icon={<Settings className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 7" />;
}
