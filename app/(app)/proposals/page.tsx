"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleWithdraw = async (proposalId: string) => {
    setWithdrawing(proposalId);
    try {
      await withdrawProposal({ proposalId: proposalId as Id<"proposals"> });
      toast.success("Proposal withdrawn.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          My Proposals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track proposals you have sent to request posters.
        </p>
      </div>

      {proposals === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-2 p-5">
                <div className="h-5 w-2/3 rounded bg-secondary" />
                <div className="h-4 w-1/3 rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Send className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No proposals yet</p>
            <p className="text-sm text-muted-foreground">
              Browse requests and send your first proposal.
            </p>
            <Button asChild className="mt-2 rounded-full bg-jade text-white hover:bg-jade/90">
              <Link href="/requests">Browse Requests</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Card key={p._id}>
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={withdrawing === p._id}
                    onClick={() => handleWithdraw(p._id)}
                  >
                    <Undo2 className="mr-1.5 size-3.5" />
                    Withdraw
                  </Button>
                )}

                {p.status === "accepted" && (
                  <div className="rounded-lg border border-jade/20 bg-jade/5 p-3 text-sm">
                    <p className="font-medium text-jade">Your proposal was accepted!</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Payment integration coming soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
