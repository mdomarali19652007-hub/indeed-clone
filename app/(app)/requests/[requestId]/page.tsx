"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/convex-error";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextDisplay } from "@/components/rich-text-display";
import { fadeInUp, staggerContainer, tapScale } from "@/lib/animations";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Send,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  bug_fix: "Bug Fix",
  new_project: "New Project",
  feature: "Feature",
  consultation: "Consultation",
  hiring: "Hiring",
  other: "Other",
};

const TIMELINE_LABELS: Record<string, string> = {
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

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();

  const request = useQuery(api.requests.getRequestById, {
    requestId: requestId as Id<"requests">,
  });
  const isFavorited = useQuery(api.favorites.isRequestFavorited, {
    requestId: requestId as Id<"requests">,
  });

  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const submitProposal = useMutation(api.proposals.submitProposal);

  const [message, setMessage] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (request === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">Request not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/requests")}>
            Back to Browse
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite({ requestId: requestId as Id<"requests"> });
      } else {
        await addFavorite({ requestId: requestId as Id<"requests"> });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmitProposal = async () => {
    if (!message.trim()) {
      toast.error("Please write a proposal message.");
      return;
    }
    setSubmitting(true);
    try {
      await submitProposal({
        requestId: requestId as Id<"requests">,
        message: message.trim(),
        proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
        proposedTimeline: proposedTimeline.trim() || undefined,
      });
      setSubmitted(true);
      setMessage("");
      setProposedBudget("");
      setProposedTimeline("");
      toast.success("Proposal submitted!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.button
        variants={fadeInUp}
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </motion.button>

      {/* Request detail */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
                  {request.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-3.5" />
                  <span>
                    {request.posterName}
                    {request.companyName ? ` (${request.companyName})` : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={request.isOpen ? "default" : "secondary"}>
                  {request.isOpen ? "Open" : "Closed"}
                </Badge>
                <motion.button
                  whileTap={tapScale}
                  whileHover={{ scale: 1.1 }}
                  onClick={handleToggleFavorite}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={isFavorited ? "Remove from saved" : "Save"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isFavorited ? (
                      <motion.div
                        key="saved"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <BookmarkCheck className="size-4 text-jade" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="unsaved"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Bookmark className="size-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant="secondary">
                {CATEGORY_LABELS[request.category] ?? request.category}
              </Badge>
              <span className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="size-3" />
                {formatBudget(request.budgetType, request.budgetMin, request.budgetMax, request.budgetCurrency)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" />
                {TIMELINE_LABELS[request.timeline] ?? request.timeline}
              </span>
              <span className="text-jade">
                {request.proposalCount} proposal{request.proposalCount !== 1 ? "s" : ""}
              </span>
            </div>

            {request.skillsNeeded.length > 0 && (
              <motion.div
                variants={staggerContainer(0.05)}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-1.5"
              >
                {request.skillsNeeded.map((skill: string) => (
                  <motion.div key={skill} variants={fadeInUp}>
                    <Badge variant="outline" className="text-xs">
                      <Tag className="mr-1 size-2.5" />
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="prose prose-sm max-w-none">
              <RichTextDisplay content={request.description} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proposal form */}
      {request.isOpen && (
        <motion.div variants={fadeInUp}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <CheckCircle2 className="size-12 text-jade" />
                    </motion.div>
                    <h3 className="text-lg font-semibold">Proposal Sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      The request poster will review your proposal and get back
                      to you.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 rounded-full"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Proposal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
                      <Send className="size-4 text-jade" />
                      Send Your Proposal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Your message <span className="text-red-400">*</span>
                      </label>
                      <Textarea
                        placeholder="Explain why you're the right person for this. Mention relevant experience, your approach, and any questions you have."
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        {message.length} characters
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Your proposed budget (optional)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g. 5000"
                          value={proposedBudget}
                          onChange={(e) => setProposedBudget(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Estimated timeline (optional)
                        </label>
                        <Input
                          placeholder="e.g. 3 days, 1 week"
                          value={proposedTimeline}
                          onChange={(e) => setProposedTimeline(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmitProposal}
                      disabled={submitting || !message.trim()}
                      className="rounded-full bg-jade text-white hover:bg-jade/90"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {submitting ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Sending...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <Send className="mr-2 size-4" />
                            Submit Proposal
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  );
}
