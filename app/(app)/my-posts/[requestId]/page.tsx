"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextDisplay } from "@/components/rich-text-display";
import {
  ArrowLeft,
  Check,
  Clock,
  DollarSign,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-600",
};

export default function ManageRequestPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const [actionPending, setActionPending] = useState<string | null>(null);

  const request = useQuery(api.requests.getRequestById, {
    requestId: requestId as Id<"requests">,
  });
  const proposals = useQuery(api.proposals.listProposalsForRequest, {
    requestId: requestId as Id<"requests">,
    limit: 100,
  });
  const updateStatus = useMutation(api.proposals.updateProposalStatus);
  const closeRequest = useMutation(api.requests.closeRequest);

  if (request === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-secondary" />
        <div className="h-40 rounded bg-secondary" />
      </div>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">Request not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/my-posts")}>
            Back to My Posts
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleAccept = async (proposalId: string) => {
    setActionPending(proposalId);
    try {
      await updateStatus({
        proposalId: proposalId as Id<"proposals">,
        status: "accepted",
      });
      toast.success("Proposal accepted! The request has been closed.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionPending(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    setActionPending(proposalId);
    try {
      await updateStatus({
        proposalId: proposalId as Id<"proposals">,
        status: "rejected",
      });
      toast.success("Proposal rejected.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionPending(null);
    }
  };

  const handleCloseRequest = async () => {
    try {
      await closeRequest({ requestId: requestId as Id<"requests"> });
      toast.success("Request closed.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <button
        onClick={() => router.push("/my-posts")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to My Posts
      </button>

      {/* Request summary */}
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-(family-name:--font-bricolage) text-xl font-bold tracking-tight">
              {request.title}
            </h1>
            <Badge variant={request.isOpen ? "default" : "secondary"}>
              {request.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <div className="prose prose-sm max-w-none">
            <RichTextDisplay content={request.description} />
          </div>
          {request.isOpen && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleCloseRequest}
            >
              <XCircle className="mr-1.5 size-3.5" />
              Close Request
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Proposals */}
      <div>
        <h2 className="font-(family-name:--font-bricolage) mb-4 text-lg font-bold tracking-tight">
          Proposals ({proposals?.length ?? 0})
        </h2>

        {proposals === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="space-y-2 p-5">
                  <div className="h-5 w-1/3 rounded bg-secondary" />
                  <div className="h-16 rounded bg-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <Send className="size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No proposals yet. Developers will see your request and send proposals.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <Card key={p._id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-medium">{p.proposerName}</span>
                      {p.profile?.headline && (
                        <span className="text-xs text-muted-foreground">
                          - {p.profile.headline}
                        </span>
                      )}
                    </div>
                    <Badge className={STATUS_COLORS[p.status] ?? ""}>
                      {p.status}
                    </Badge>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">{p.message}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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
                    <span>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {p.profile?.skills && p.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.profile.skills.slice(0, 5).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {p.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="rounded-full bg-jade text-white hover:bg-jade/90"
                        disabled={!!actionPending}
                        onClick={() => handleAccept(p._id)}
                      >
                        <Check className="mr-1.5 size-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={!!actionPending}
                        onClick={() => handleReject(p._id)}
                      >
                        <X className="mr-1.5 size-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {p.status === "accepted" && (
                    <div className="rounded-lg border border-jade/20 bg-jade/5 p-3 text-sm">
                      <p className="font-medium text-jade">Proposal accepted</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Payment integration coming soon (bKash, Nagad, Rocket).
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
