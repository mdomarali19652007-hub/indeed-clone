"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function PostRequestPage() {
  const router = useRouter();
  const createRequest = useMutation(api.requests.createRequest);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("bug_fix");
  const [budgetType, setBudgetType] = useState<string>("negotiable");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timeline, setTimeline] = useState<string>("flexible");
  const [skillsInput, setSkillsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe what you need.");
      return;
    }

    setSubmitting(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const requestId = await createRequest({
        title: title.trim(),
        description: description.trim(),
        category: category as "bug_fix" | "new_project" | "feature" | "consultation" | "hiring" | "other",
        budgetType: budgetType as "fixed" | "hourly" | "negotiable",
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        budgetCurrency: "BDT",
        timeline: timeline as "urgent" | "within_a_week" | "within_a_month" | "flexible",
        skillsNeeded: skills.length > 0 ? skills : undefined,
      });

      toast.success("Request posted!");
      router.push(`/my-posts`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          Post a Request
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell developers what you need. The more details, the better proposals you will get.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
            <PlusCircle className="size-4 text-jade" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Fix login bug in React app"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Describe the problem or what you need built. Include any relevant details like tech stack, deadlines, or requirements."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              className="h-9 w-full rounded-lg border border-border bg-transparent px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="bug_fix">Bug Fix</option>
              <option value="new_project">New Project</option>
              <option value="feature">New Feature</option>
              <option value="consultation">Consultation</option>
              <option value="hiring">Hiring</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Budget</label>
            <select
              className="mb-2 h-9 w-full rounded-lg border border-border bg-transparent px-3 text-sm"
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
            >
              <option value="negotiable">Negotiable</option>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly rate</option>
            </select>
            {budgetType !== "negotiable" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min (BDT)"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max (BDT)"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Timeline</label>
            <select
              className="h-9 w-full rounded-lg border border-border bg-transparent px-3 text-sm"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            >
              <option value="urgent">Urgent</option>
              <option value="within_a_week">Within a week</option>
              <option value="within_a_month">Within a month</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Skills needed (optional)
            </label>
            <Input
              placeholder="e.g. React, Node.js, Python (comma separated)"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separate skills with commas.
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full rounded-full bg-jade text-base font-semibold text-white hover:bg-jade/90"
          >
            <Send className="mr-2 size-4" />
            {submitting ? "Posting..." : "Post Request"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
