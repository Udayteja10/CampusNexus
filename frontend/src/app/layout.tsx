import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthHydrator } from "@/components/auth/AuthHydrator";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CampusNexus",
    template: "%s | CampusNexus",
  },
  description:
    "An Integrated Academic and Campus Community Platform for students.",
  keywords: ["campus", "academic", "community", "students", "placement"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <TooltipProvider delay={300}>
            {/* Hydrate persisted auth session from storage */}
            <AuthHydrator />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
