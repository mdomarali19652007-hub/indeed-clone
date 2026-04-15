"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stripHtml } from "@/lib/strip-html";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { fadeInUp, staggerContainer, tapScale } from "@/lib/animations";
import { BookmarkCheck, DollarSign, Heart } from "lucide-react";
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
    <section className="space-y-6">
      <PageHeader
        title="Saved Requests"
        description="Requests you have saved for later."
      />

      {favorites === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="size-8 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved requests"
          description="Browse requests and tap the bookmark icon to save them here."
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence>
            {favorites.map((fav) => {
              if (!fav.request) return null;
              const req = fav.request;
              return (
                <motion.div
                  key={fav._id}
                  variants={fadeInUp}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  layout
                >
                  <Card className="group">
                    <CardContent className="flex items-start gap-4 p-5">
                      <Link
                        href={`/requests/${req._id}`}
                        className="min-w-0 flex-1 space-y-2"
                      >
                        <h3 className="font-semibold leading-tight group-hover:text-jade">
                          {req.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {stripHtml(req.description)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <Badge
                            variant={req.isOpen ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {req.isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3" />
                            {req.budgetType === "negotiable"
                              ? "Negotiable"
                              : `${req.budgetMin ?? 0} - ${req.budgetMax ?? 0} ${req.budgetCurrency ?? "BDT"}`}
                          </span>
                        </div>
                      </Link>
                      <motion.button
                        whileTap={tapScale}
                        onClick={() => handleRemove(req._id)}
                        className="shrink-0 rounded-full p-2 text-jade transition-colors hover:bg-secondary"
                        aria-label="Remove from saved"
                      >
                        <BookmarkCheck className="size-4" />
                      </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
