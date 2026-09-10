import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Hub | CampusNexus",
  description: "Access course notes, PYQs, subjects, study groups, faculty reviews, and campus guidelines.",
};

export default function AcademicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full w-full">{children}</div>;
}
