import React from "react";
import { Badge } from "@/components/ui/badge";
import { getDepartmentById, getDepartmentId } from "@/lib/departments";
import { cn } from "@/lib/utils";

interface DeptBadgeProps {
  departmentIdOrName?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "secondary";
}

export function DeptBadge({
  departmentIdOrName,
  className,
  size = "md",
  variant = "outline",
}: DeptBadgeProps) {
  const deptId = getDepartmentId(departmentIdOrName) || "cse";
  const dept = getDepartmentById(deptId);

  const shortName = dept ? dept.shortName : (departmentIdOrName || "CSE").toUpperCase();

  const colorStyles: Record<string, string> = {
    cse: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    ece: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    it: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    aids: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    csit: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    mech: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    civil: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    eee: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  };

  const selectedColor = colorStyles[deptId.toLowerCase()] || colorStyles.cse;

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0 font-medium",
    md: "text-xs px-2 py-0.5 font-medium",
    lg: "text-sm px-2.5 py-1 font-semibold",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-md transition-colors border",
        selectedColor,
        sizeStyles[size],
        className
      )}
    >
      {shortName}
    </Badge>
  );
}
