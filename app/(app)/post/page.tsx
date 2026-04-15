"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillTagInput } from "@/components/skill-tag-input";
import { PageHeader } from "@/components/page-header";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Loader2, PlusCircle, Send } from "lucide-react";
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
  const [skills, setSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => {
    let filled = 0;
    const total = 4;
    if (title.trim()) filled++;
    if (description.trim()) filled++;
    if (category) filled++;
    if (timeline) filled++;
    return Math.round((filled / total) * 100);
  }, [title, description, category, timeline]);

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
      await createRequest({
        title: title.trim(),
        description: description.trim(),
        category: category as
          | "bug_fix"
          | "new_project"
          | "feature"
          | "consultation"
          | "hiring"
          | "other",
        budgetType: budgetType as "fixed" | "hourly" | "negotiable",
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        budgetCurrency: "BDT",
        timeline: timeline as
          | "urgent"
          | "within_a_week"
          | "within_a_month"
          | "flexible",
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
    <motion.section
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl space-y-6"
    >
      <PageHeader
        title="Post a Request"
        description="Tell developers what you need. The more details, the better proposals you will get."
      />

      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-(family-name:--font-bricolage) text-lg tracking-tight">
              <PlusCircle className="size-4 text-jade" />
              Request Details
            </CardTitle>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Form completion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
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
              <label className="mb-1.5 block text-sm font-medium">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem value="new_project">New Project</SelectItem>
                  <SelectItem value="feature">New Feature</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="hiring">Hiring</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Budget
              </label>
              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger className="mb-2">
                  <SelectValue placeholder="Budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                  <SelectItem value="fixed">Fixed price</SelectItem>
                  <SelectItem value="hourly">Hourly rate</SelectItem>
                </SelectContent>
              </Select>
              <AnimatePresence>
                {budgetType !== "negotiable" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timeline */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Timeline
              </label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="within_a_week">Within a week</SelectItem>
                  <SelectItem value="within_a_month">
                    Within a month
                  </SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Skills needed (optional)
              </label>
              <SkillTagInput
                value={skills}
                onChange={setSkills}
                placeholder="e.g. React, Node.js, Python"
              />
            </div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.01 }}>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="w-full rounded-full bg-jade text-base font-semibold text-white hover:bg-jade/90"
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
                      Posting...
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
                      Post Request
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
