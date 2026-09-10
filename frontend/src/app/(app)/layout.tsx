"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { Topbar } from "@/components/shell/Topbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Main content column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarCollapsed((c) => !c)}
          />

          <main
            id="main-content"
            className={cn(
              "flex-1 overflow-y-auto",
              "p-4 sm:p-6",
              "animate-fade-in"
            )}
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
