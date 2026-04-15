"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stripHtml } from "@/lib/strip-html";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  fadeInUp,
  staggerContainer,
  cardHover,
  tapScale,
} from "@/lib/animations";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  DollarSign,
  Search,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

type Category = "bug_fix" | "new_project" | "feature" | "consultation" | "hiring" | "other";
type BudgetType = "fixed" | "hourly" | "negotiable";
type Timeline = "urgent" | "within_a_week" | "within_a_month" | "flexible";

const CATEGORY_LABELS: Record<Category, string> = {
  bug_fix: "Bug Fix",
  new_project: "New Project",
  feature: "Feature",
  consultation: "Consultation",
  hiring: "Hiring",
  other: "Other",
};

const TIMELINE_LABELS: Record<Timeline, string> = {
  urgent: "Urgent",
  within_a_week: "Within a week",
  within_a_month: "Within a month",
  flexible: "Flexible",
};

function formatBudget(type: string, min?: number, max?: number, currency?: string) {
  const unit = currency ?? "BDT";
  if (type === "negotiable") return "Negotiable";
  if (min !== undefined && max !== undefined)
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${unit}`;
  if (max !== undefined) return `Up to ${max.toLocaleString()} ${unit}`;
  if (min !== undefined) return `From ${min.toLocaleString()} ${unit}`;
  return "Not specified";
}

export default function BrowseRequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<Category | "">(
    (searchParams.get("category") as Category) ?? "",
  );
  const [budgetType, setBudgetType] = useState<BudgetType | "">("");
  const [timeline, setTimeline] = useState<Timeline | "">("");

  const requests = useQuery(api.requests.searchRequests, {
    searchText: searchText.trim() || undefined,
    category: category || undefined,
    budgetType: budgetType || undefined,
    timeline: timeline || undefined,
    limit: 30,
  });

  const favorites = useQuery(api.favorites.listMyFavorites, { limit: 200 });
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const [pendingFavId, setPendingFavId] = useState<string | null>(null);

  const favoriteRequestIds = useMemo(
    () => new Set((favorites ?? []).map((f) => f.request?._id).filter(Boolean)),
    [favorites],
  );

  const handleToggleFavorite = async (requestId: string) => {
    setPendingFavId(requestId);
    try {
      if (favoriteRequestIds.has(requestId as never)) {
        await removeFavorite({ requestId: requestId as never });
      } else {
        await addFavorite({ requestId: requestId as never });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingFavId(null);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Browse Requests"
        description="Find requests from people who need developers. Send your proposal to get hired."
      />

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            placeholder="Search by title, skill, or keyword..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={category || "all"}
            onValueChange={(v) => setCategory(v === "all" ? "" : (v as Category))}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="bug_fix">Bug Fix</SelectItem>
              <SelectItem value="new_project">New Project</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="hiring">Hiring</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={budgetType || "all"}
            onValueChange={(v) => setBudgetType(v === "all" ? "" : (v as BudgetType))}
          >
            <SelectTrigger className="h-9 w-auto min-w-[130px]">
              <SelectValue placeholder="Any budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any budget</SelectItem>
              <SelectItem value="fixed">Fixed price</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="negotiable">Negotiable</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={timeline || "all"}
            onValueChange={(v) => setTimeline(v === "all" ? "" : (v as Timeline))}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px]">
              <SelectValue placeholder="Any timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any timeline</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="within_a_week">Within a week</SelectItem>
              <SelectItem value="within_a_month">Within a month</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Results */}
      {requests === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No requests found"
          description="Try changing your search or filters."
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {requests.map((req: any) => {
            const isFav = favoriteRequestIds.has(req._id as never);
            const isPending = pendingFavId === req._id;
            return (
              <motion.div key={req._id} variants={fadeInUp}>
                <motion.div whileHover={cardHover}>
                  <Card
                    className="group cursor-pointer transition-colors hover:border-jade/30"
                    onClick={() => router.push(`/requests/${req._id}`)}
                  >
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold leading-tight">{req.title}</h3>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {CATEGORY_LABELS[req.category as Category] ?? req.category}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {stripHtml(req.description)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3" />
                            {formatBudget(req.budgetType, req.budgetMin, req.budgetMax, req.budgetCurrency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {TIMELINE_LABELS[req.timeline as Timeline] ?? req.timeline}
                          </span>
                          {req.skillsNeeded.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="size-3" />
                              {req.skillsNeeded.slice(0, 3).join(", ")}
                              {req.skillsNeeded.length > 3 && ` +${req.skillsNeeded.length - 3}`}
                            </span>
                          )}
                          <span className="text-jade">
                            {req.proposalCount} proposal{req.proposalCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          by {req.posterName}
                          {req.companyName ? ` (${req.companyName})` : ""}
                        </p>
                      </div>
                      <motion.button
                        whileTap={tapScale}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(req._id);
                        }}
                        disabled={isPending}
                        aria-label={isFav ? "Remove from saved" : "Save request"}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isFav ? (
                            <motion.div
                              key="saved"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <BookmarkCheck className="size-4 text-jade" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unsaved"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Bookmark className="size-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
