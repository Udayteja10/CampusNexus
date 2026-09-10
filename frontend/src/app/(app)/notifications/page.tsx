import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { Bell } from "lucide-react";
export const metadata: Metadata = { title: "Notifications" };
export default function NotificationsPage() {
  return <ModulePlaceholder title="Notifications" description="All your campus notifications in one place — coming in Phase 6." icon={<Bell className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 6" />;
}
