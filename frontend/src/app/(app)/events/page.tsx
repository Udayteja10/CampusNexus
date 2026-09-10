import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { CalendarDays } from "lucide-react";
export const metadata: Metadata = { title: "Events" };
export default function EventsPage() {
  return <ModulePlaceholder title="Events" description="Campus events, workshops and registrations — coming in Phase 5." icon={<CalendarDays className="h-8 w-8 text-[var(--cn-rose)]" />} phase="Phase 5" />;
}
