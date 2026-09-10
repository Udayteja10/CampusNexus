"use client";

import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ProfileMenu } from "@/components/shell/ProfileMenu";
import { MobileNav } from "@/components/shell/MobileNav";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md sm:px-6"
        role="banner"
      >
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop menu trigger (for sidebar collapse) */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 lg:flex"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Global search */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search CampusNexus…"
            aria-label="Global search"
            className="h-9 pl-9 text-sm bg-muted/40 border-border/60 focus-visible:bg-background"
          />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {/* Mock unread badge */}
              <span
                className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-[var(--cn-rose)]"
                aria-hidden="true"
              />
            </Button>
          </div>

          <ThemeToggle />
          <ProfileMenu />
        </div>
      </header>

      {/* Mobile navigation sheet */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
