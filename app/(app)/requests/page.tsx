"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { stripHtml } from "@/lib/strip-html";
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
    <section className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          Browse Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find requests from people who need developers. Send your proposal to get hired.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
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
          <select
            className="h-9 rounded-lg border border-border bg-transparent px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
          >
            <option value="">All categories</option>
            <option value="bug_fix">Bug Fix</option>
            <option value="new_project">New Project</option>
            <option value="feature">Feature</option>
            <option value="consultation">Consultation</option>
            <option value="hiring">Hiring</option>
            <option value="other">Other</option>
          </select>
          <select
            className="h-9 rounded-lg border border-border bg-transparent px-3 text-sm"
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value as BudgetType | "")}
          >
            <option value="">Any budget</option>
            <option value="fixed">Fixed price</option>
            <option value="hourly">Hourly</option>
            <option value="negotiable">Negotiable</option>
          </select>
          <select
            className="h-9 rounded-lg border border-border bg-transparent px-3 text-sm"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value as Timeline | "")}
          >
            <option value="">Any timeline</option>
            <option value="urgent">Urgent</option>
            <option value="within_a_week">Within a week</option>
            <option value="within_a_month">Within a month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {requests === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-3 p-5">
                <div className="h-5 w-2/3 rounded bg-secondary" />
                <div className="h-4 w-1/2 rounded bg-secondary" />
                <div className="h-3 w-full rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No requests found</p>
            <p className="text-sm text-muted-foreground">
              Try changing your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isFav = favoriteRequestIds.has(req._id as never);
            const isPending = pendingFavId === req._id;
            return (
              <Card
                key={req._id}
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
                  <button
                    className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(req._id);
                    }}
                    disabled={isPending}
                    aria-label={isFav ? "Remove from saved" : "Save request"}
                  >
                    {isFav ? (
                      <BookmarkCheck className="size-4 text-jade" />
                    ) : (
                      <Bookmark className="size-4" />
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
