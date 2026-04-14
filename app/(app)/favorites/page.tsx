"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { stripHtml } from "@/lib/strip-html";
import { BookmarkCheck, Clock, DollarSign, Heart } from "lucide-react";
import { toast } from "sonner";

export default function FavoritesPage() {
  const favorites = useQuery(api.favorites.listMyFavorites, { limit: 50 });
  const removeFavorite = useMutation(api.favorites.removeFavorite);

  const handleRemove = async (requestId: string) => {
    try {
      await removeFavorite({ requestId: requestId as Id<"requests"> });
      toast.success("Removed from saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          Saved Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Requests you have saved for later.
        </p>
      </div>

      {favorites === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-2 p-5">
                <div className="h-5 w-2/3 rounded bg-secondary" />
                <div className="h-3 w-full rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Heart className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No saved requests</p>
            <p className="text-sm text-muted-foreground">
              Browse requests and tap the bookmark icon to save them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => {
            if (!fav.request) return null;
            const req = fav.request;
            return (
              <Card key={fav._id} className="group">
                <CardContent className="flex items-start gap-4 p-5">
                  <Link href={`/requests/${req._id}`} className="min-w-0 flex-1 space-y-2">
                    <h3 className="font-semibold leading-tight group-hover:text-jade">
                      {req.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {stripHtml(req.description)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant={req.isOpen ? "default" : "secondary"} className="text-[10px]">
                        {req.isOpen ? "Open" : "Closed"}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        {req.budgetType === "negotiable" ? "Negotiable" : `${req.budgetMin ?? 0} - ${req.budgetMax ?? 0} ${req.budgetCurrency ?? "BDT"}`}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(req._id)}
                    className="shrink-0 rounded-full p-2 text-jade transition-colors hover:bg-secondary"
                    aria-label="Remove from saved"
                  >
                    <BookmarkCheck className="size-4" />
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
