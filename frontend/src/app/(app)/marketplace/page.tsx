import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { ShoppingBag } from "lucide-react";
export const metadata: Metadata = { title: "Marketplace" };
export default function MarketplacePage() {
  return <ModulePlaceholder title="Marketplace" description="Buy, sell and trade items with fellow students — coming in Phase 6." icon={<ShoppingBag className="h-8 w-8 text-[var(--cn-indigo)]" />} phase="Phase 6" />;
}
