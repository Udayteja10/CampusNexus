import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";

export const metadata: Metadata = {
  title: "Community Feed | CampusNexus",
  description: "Browse and participate in campus discussions on CampusNexus.",
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <CommunityFeed />
    </div>
  );
}
