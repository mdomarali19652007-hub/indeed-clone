"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Code2,
  Menu,
  MessageSquareQuote,
  PenLine,
  Search,
  Send,
  Star,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";
import { StatCounter } from "@/components/stat-counter";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  fadeInUp,
  staggerContainer,
  slideInFromLeft,
  slideInFromRight,
} from "@/lib/animations";

const ROTATING_WORDS = ["developer", "expert", "freelancer"];

const HOW_IT_WORKS_CLIENT = [
  {
    icon: UserRound,
    title: "Create Account",
    description: "Sign up in seconds. No complicated forms.",
  },
  {
    icon: ClipboardList,
    title: "Post Your Request",
    description:
      "Describe what you need -- a bug fix, a new feature, or a full project.",
  },
  {
    icon: Send,
    title: "Get Proposals",
    description:
      "Developers see your request and send proposals with their price and timeline.",
  },
  {
    icon: CheckCircle2,
    title: "Pick a Developer",
    description:
      "Review proposals, accept the best one, and get your work done.",
  },
];

const HOW_IT_WORKS_DEV = [
  {
    icon: UserRound,
    title: "Create Profile",
    description: "Set up your developer profile and list your skills.",
  },
  {
    icon: Search,
    title: "Browse Requests",
    description: "Find requests that match your expertise and interests.",
  },
  {
    icon: Send,
    title: "Send Proposals",
    description:
      "Submit your proposal with your price and timeline for the work.",
  },
  {
    icon: CheckCircle2,
    title: "Get Hired",
    description: "When accepted, start working and deliver great results.",
  },
];

const CATEGORIES = [
  { label: "Bug Fix", value: "bug_fix", emoji: "🐛" },
  { label: "New Project", value: "new_project", emoji: "🚀" },
  { label: "New Feature", value: "feature", emoji: "✨" },
  { label: "Consultation", value: "consultation", emoji: "💬" },
  { label: "Hiring", value: "hiring", emoji: "👩\u200d💻" },
  { label: "Other", value: "other", emoji: "📋" },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Startup Founder",
    quote:
      "Posted a bug fix request and got 5 proposals within hours. The developer I hired fixed it the same day. Incredible.",
    rating: 5,
  },
  {
    name: "Rafiq A.",
    role: "Full-Stack Developer",
    quote:
      "DevHire lets me find real projects that match my skills. I have landed 3 clients in my first month on the platform.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Product Manager",
    quote:
      "We use DevHire whenever we need extra hands on a feature. The proposal system makes it easy to compare developers.",
    rating: 4,
  },
];

const FAQ_ITEMS = [
  {
    question: "Is it free to post a request?",
    answer:
      "Yes, posting requests is completely free. You only pay the developer you choose to hire based on the agreed terms in their proposal.",
  },
  {
    question: "How do developers get paid?",
    answer:
      "Payment is handled directly between you and the developer. We are working on integrated payment support (bKash, Nagad, Rocket) coming soon.",
  },
  {
    question: "Can I post any type of project?",
    answer:
      "Yes! Whether it is a quick bug fix, a new feature, a full project build, or even a consultation -- you can post any development-related request.",
  },
  {
    question: "What if I am not happy with a proposal?",
    answer:
      "You are never obligated to accept any proposal. You can wait for more proposals, update your request details, or close the request entirely.",
  },
  {
    question: "How do I know a developer is trustworthy?",
    answer:
      "Developer profiles include their skills, experience, GitHub links, and past work. You can review their proposal details before making a decision.",
  },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-[180px] text-left align-bottom md:w-[240px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="inline-block text-jade"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Home() {
  const [howItWorksView, setHowItWorksView] = useState<"client" | "dev">(
    "client",
  );
  const steps =
    howItWorksView === "client" ? HOW_IT_WORKS_CLIENT : HOW_IT_WORKS_DEV;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <SiteLogo />

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/requests"
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse Requests
            </Link>
            <Link
              href="/post"
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Post a Request
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-foreground/20 px-5 text-sm font-medium"
                >
                  Login / Sign up
                </Button>
              </SignInButton>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-jade px-5 text-sm font-medium text-white hover:bg-jade/90"
              >
                <Link href="/post">Post a Request</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full px-5"
              >
                <Link href="/requests">Browse Requests</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-jade px-5 text-sm font-medium text-white hover:bg-jade/90"
              >
                <Link href="/post">Post a Request</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
                  aria-label="Toggle menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav className="mt-8 flex flex-col gap-1">
                  <Link
                    href="/requests"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Browse Requests
                  </Link>
                  <Link
                    href="/post"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Post a Request
                  </Link>
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/">
                      <button className="mt-4 rounded-full border border-foreground/20 px-5 py-2 text-sm font-medium">
                        Login / Sign up
                      </button>
                    </SignInButton>
                  </SignedOut>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 text-center md:pt-24">
        {/* Floating background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 left-1/4 size-72 rounded-full bg-jade/5 blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut" as const,
            }}
          />
          <motion.div
            className="absolute -bottom-10 right-1/4 size-60 rounded-full bg-amber-accent/5 blur-3xl"
            animate={{ y: [0, 20, 0] }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut" as const,
            }}
          />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/20 bg-jade/5 px-4 py-1.5 text-sm font-medium text-jade">
              <Zap className="size-3.5" />
              The simplest way to hire developers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-(family-name:--font-bricolage) mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl"
          >
            Post your problem.{" "}
            <span className="whitespace-nowrap">
              Get a <RotatingWord />.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
          >
            Need a developer to fix a bug, build a feature, or start a project
            from scratch? Post your request and let developers come to you with
            proposals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-jade px-8 text-base font-semibold text-white hover:bg-jade/90"
            >
              <Link href="/post">
                Post a Request
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base font-semibold"
            >
              <Link href="/requests">
                <Search className="mr-2 size-4" />
                Browse Requests
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Users className="size-4" />
            Trusted by 850+ developers and growing
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <ChevronDown className="size-5 animate-bounce text-muted-foreground/40" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-card py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          <StatCounter value={1200} label="Requests Posted" suffix="+" />
          <Separator
            orientation="vertical"
            className="mx-auto hidden md:block"
          />
          <StatCounter value={850} label="Developers Registered" suffix="+" />
          <Separator
            orientation="vertical"
            className="mx-auto hidden md:block"
          />
          <StatCounter value={3400} label="Proposals Sent" suffix="+" />
          <Separator
            orientation="vertical"
            className="mx-auto hidden md:block"
          />
          <StatCounter value={94} label="Satisfaction Rate" suffix="%" />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border/40 bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            What do you need help with?
          </motion.h2>
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.value} variants={fadeInUp}>
                <Link
                  href={`/requests?category=${cat.value}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-jade/40 hover:bg-jade/5"
                >
                  <motion.span
                    className="text-3xl"
                    whileHover={{ scale: 1.15, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {cat.emoji}
                  </motion.span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Clients vs For Developers */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            Built for both sides
          </motion.h2>
          <p className="mt-2 text-center text-muted-foreground">
            Whether you need work done or want to find work, DevHire has you
            covered.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* For Clients */}
            <motion.div
              variants={slideInFromLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl border border-jade/20 bg-jade/5 p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-jade/10">
                  <UserRound className="size-5 text-jade" />
                </div>
                <h3 className="font-(family-name:--font-bricolage) text-xl font-bold">
                  For Clients
                </h3>
              </div>
              <motion.ul
                variants={staggerContainer(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  "Post a request in under a minute",
                  "Get proposals from skilled developers",
                  "Compare prices and timelines",
                  "Pick the best developer and get it done",
                ].map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeInUp}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-jade" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <Button
                asChild
                className="mt-6 rounded-full bg-jade text-white hover:bg-jade/90"
              >
                <Link href="/post">
                  Post a Request
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </motion.div>

            {/* For Developers */}
            <motion.div
              variants={slideInFromRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl border border-amber-accent/20 bg-amber-accent/5 p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-accent/10">
                  <Code2 className="size-5 text-amber-accent" />
                </div>
                <h3 className="font-(family-name:--font-bricolage) text-xl font-bold">
                  For Developers
                </h3>
              </div>
              <motion.ul
                variants={staggerContainer(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  "Browse real requests from real clients",
                  "Send proposals with your terms",
                  "Build your reputation and portfolio",
                  "Get paid for your expertise",
                ].map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeInUp}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-accent" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-full border-amber-accent/30 hover:bg-amber-accent/10"
              >
                <Link href="/requests">
                  Browse Requests
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            How it works
          </motion.h2>
          <p className="mt-2 text-center text-muted-foreground">
            Four simple steps. No complexity.
          </p>

          {/* Toggle */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setHowItWorksView("client")}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  howItWorksView === "client"
                    ? "bg-jade text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Client View
              </button>
              <button
                onClick={() => setHowItWorksView("dev")}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  howItWorksView === "dev"
                    ? "bg-jade text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Developer View
              </button>
            </div>
          </div>

          <motion.div
            variants={staggerContainer(0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            key={howItWorksView}
            className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Connector line (desktop) */}
            <div className="absolute top-7 right-0 left-0 z-0 hidden h-0.5 lg:block">
              <motion.div
                className="h-full bg-jade/20"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ transformOrigin: "left" }}
              />
            </div>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={`${howItWorksView}-${i}`}
                  variants={fadeInUp}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-jade/20 bg-card text-jade">
                    <Icon className="size-6" />
                  </div>
                  <span className="mt-2 flex size-6 items-center justify-center rounded-full bg-jade/10 text-xs font-bold text-jade">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            What people are saying
          </motion.h2>
          <p className="mt-2 text-center text-muted-foreground">
            Real feedback from clients and developers on the platform.
          </p>

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-10 grid gap-6 md:grid-cols-3"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <MessageSquareQuote className="absolute top-4 right-4 size-8 text-jade/10" />
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < t.rating ? "fill-amber-accent text-amber-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-jade/10 text-sm font-bold text-jade">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40 bg-secondary/30 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            Frequently asked questions
          </motion.h2>
          <p className="mt-2 text-center text-muted-foreground">
            Everything you need to know to get started.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-5"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-jade/10 via-jade/5 to-amber-accent/10" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-(family-name:--font-bricolage) text-3xl font-bold tracking-tight md:text-4xl"
          >
            Ready to find your developer?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-muted-foreground"
          >
            It takes less than a minute to post a request. Try it now.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-jade px-8 text-base font-semibold text-white hover:bg-jade/90"
            >
              <Link href="/post">
                Post a Request -- It&apos;s Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base font-semibold"
            >
              <Link href="/requests">Browse Requests</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <SiteLogo />
              <p className="mt-3 text-sm text-muted-foreground">
                Post your problem. Get a developer. The simplest way to find dev
                talent.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/requests" className="hover:text-foreground">
                    Browse Requests
                  </Link>
                </li>
                <li>
                  <Link href="/post" className="hover:text-foreground">
                    Post a Request
                  </Link>
                </li>
                <li>
                  <Link href="/proposals" className="hover:text-foreground">
                    My Proposals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">For Developers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/requests" className="hover:text-foreground">
                    Find Work
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-foreground">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link href="/proposals" className="hover:text-foreground">
                    Track Proposals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="cursor-default">Terms of Service</span>
                </li>
                <li>
                  <span className="cursor-default">Privacy Policy</span>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DevHire. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
