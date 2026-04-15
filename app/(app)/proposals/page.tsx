"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { fadeInUp, staggerContainer, tapScale } from "@/lib/animations";
import { Clock, DollarSign, Send, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-600",
};

export default function MyProposalsPage() {
  const proposals = useQuery(api.proposals.listMyProposals, { limit: 50 });
  const withdrawProposal = useMutation(api.proposals.withdrawProposal);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  const handleWithdraw = async (proposalId: string) => {
    setWithdrawing(proposalId);
    try {
      await withdrawProposal({ proposalId: proposalId as Id<"proposals"> });
      toast.success("Proposal withdrawn.");
      setDialogOpen(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Proposals"
        description="Track proposals you have sent to request posters."
      />

      {proposals === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-5">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No proposals yet"
          description="Browse requests and send your first proposal."
          action={
            <Button
              asChild
              className="mt-2 rounded-full bg-jade text-white hover:bg-jade/90"
            >
              <Link href="/requests">Browse Requests</Link>
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {proposals.map((p: any) => (
            <motion.div key={p._id} variants={fadeInUp}>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/requests/${p.requestId}`}
                        className="font-semibold leading-tight hover:text-jade hover:underline"
                      >
                        {p.request?.title ?? "Deleted request"}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {p.message}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[p.status] ?? ""}>
                      {p.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {p.proposedBudget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        {p.proposedBudget.toLocaleString()} BDT
                      </span>
                    )}
                    {p.proposedTimeline && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {p.proposedTimeline}
                      </span>
                    )}
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  {p.status === "pending" && (
                    <Dialog
                      open={dialogOpen === p._id}
                      onOpenChange={(open) =>
                        setDialogOpen(open ? p._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <motion.div whileTap={tapScale} className="inline-block">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                          >
                            <Undo2 className="mr-1.5 size-3.5" />
                            Withdraw
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Withdraw Proposal?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to withdraw this proposal?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={withdrawing === p._id}
                            onClick={() => handleWithdraw(p._id)}
                          >
                            {withdrawing === p._id
                              ? "Withdrawing..."
                              : "Withdraw"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {p.status === "accepted" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg border border-jade/20 bg-jade/5 p-3 text-sm"
                    >
                      <p className="font-medium text-jade">
                        Your proposal was accepted!
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Payment integration coming soon.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
