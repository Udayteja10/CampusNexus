"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Search,
  Trash2,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { CareerApplication, ApplicationStatus } from "@/types/career.types";
import { careerService } from "@/services/career";

export default function MyApplicationsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Withdrawal dialog state
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedAppToWithdraw, setSelectedAppToWithdraw] = useState<CareerApplication | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await careerService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  }

  const handleWithdraw = async () => {
    if (!selectedAppToWithdraw) return;
    setWithdrawing(true);
    try {
      await careerService.withdrawApplication(selectedAppToWithdraw.id);
      toast.success("Application withdrawn successfully");
      setWithdrawDialogOpen(false);
      setSelectedAppToWithdraw(null);
      await loadApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw application");
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesType = typeFilter === "all" || app.opportunityType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [applications, searchQuery, statusFilter, typeFilter]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPLIED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Applied
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case "SHORTLISTED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
            <Sparkles className="h-3 w-3 mr-1" />
            Shortlisted
          </Badge>
        );
      case "INTERVIEW":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
            <Calendar className="h-3 w-3 mr-1" />
            Interview Stage
          </Badge>
        );
      case "SELECTED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Selected / Offered
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="h-3 w-3 mr-1" />
            Not Selected
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
            Withdrawn
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileCheck className="h-8 w-8 text-primary" />
            My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your placement and internship applications across campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={ROUTES.CAREER_PLACEMENTS} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Briefcase className="h-4 w-4 mr-2" />
            Find Placements
          </Link>
          <Link href={ROUTES.CAREER_INTERNSHIPS} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Find Internships
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="relative sm:col-span-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="sm:col-span-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="SELECTED">Selected</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PLACEMENT">Placements</SelectItem>
                  <SelectItem value="INTERNSHIP">Internships</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-4 bg-card">
          <FileCheck className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No applications found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No applications matched your filter criteria."
              : "You have not submitted any placement or internship applications yet."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href={ROUTES.CAREER_PLACEMENTS} className={buttonVariants({ variant: "default" })}>
              Browse Placements
            </Link>
            <Link href={ROUTES.CAREER_INTERNSHIPS} className={buttonVariants({ variant: "outline" })}>
              Browse Internships
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const detailUrl =
              app.opportunityType === "PLACEMENT"
                ? `${ROUTES.CAREER_PLACEMENTS}/${app.opportunityId}`
                : `${ROUTES.CAREER_INTERNSHIPS}/${app.opportunityId}`;

            const canWithdraw = app.status === "APPLIED" || app.status === "UNDER_REVIEW";

            return (
              <Card key={app.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Role, Company, and Meta */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={detailUrl}
                          className="text-base font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                          {app.role}
                          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Badge variant="secondary" className="text-xs font-semibold uppercase">
                          {app.opportunityType}
                        </Badge>
                        {getStatusBadge(app.status)}
                      </div>

                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {app.companyName}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied on:{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {app.resumeTitle && (
                          <span className="flex items-center gap-1 text-primary">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Resume: {app.resumeTitle}
                          </span>
                        )}
                        {app.notes && (
                          <span className="italic text-muted-foreground truncate max-w-xs">
                            Note: {app.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link href={detailUrl} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        View Opening
                      </Link>

                      {canWithdraw && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setSelectedAppToWithdraw(app);
                            setWithdrawDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Withdraw Confirmation Alert Dialog */}
      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application for{" "}
              <strong>{selectedAppToWithdraw?.role}</strong> at{" "}
              <strong>{selectedAppToWithdraw?.companyName}</strong>? This action will cancel your
              candidacy and mark the application as withdrawn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={withdrawing}
              onClick={handleWithdraw}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {withdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
