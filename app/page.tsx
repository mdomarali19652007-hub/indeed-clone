"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Menu,
  PenLine,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

const HOW_IT_WORKS = [
  {
    icon: UserRound,
    title: "Create Account",
    description: "Sign up in seconds. No complicated forms.",
  },
  {
    icon: ClipboardList,
    title: "Post Your Request",
    description: "Describe what you need - a bug fix, a new feature, or a full project.",
  },
  {
    icon: Send,
    title: "Get Proposals",
    description: "Developers see your request and send proposals with their price and timeline.",
  },
  {
    icon: CheckCircle2,
    title: "Pick a Developer",
    description: "Review proposals, accept the best one, and get your work done.",
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

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <Button asChild variant="outline" size="sm" className="rounded-full px-5">
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
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border/40 bg-background px-6 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/requests"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Browse Requests
              </Link>
              <Link
                href="/post"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Post a Request
              </Link>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/">
                  <button className="mt-2 rounded-full border border-foreground/20 px-5 py-2 text-sm font-medium">
                    Login / Sign up
                  </button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 text-center md:pt-24">
        <h1 className="font-(family-name:--font-bricolage) mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Post your problem.{" "}
          <span className="text-jade">Get a developer.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Need a developer to fix a bug, build a feature, or start a project from scratch?
          Post your request and let developers come to you with proposals.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-border/40 bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl">
            What do you need help with?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/requests?category=${cat.value}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-jade/40 hover:bg-jade/5"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-(family-name:--font-bricolage) text-center text-2xl font-bold tracking-tight md:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Four simple steps. No complexity.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-jade/10 text-jade">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-jade/5 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight md:text-3xl">
            Ready to find your developer?
          </h2>
          <p className="mt-2 text-muted-foreground">
            It takes less than a minute to post a request. Try it now.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 rounded-full bg-jade px-8 text-base font-semibold text-white hover:bg-jade/90"
          >
            <Link href="/post">
              Post a Request - It&apos;s Free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground">
          <SiteLogo />
          <p className="mt-2">Post your problem. Get a developer.</p>
        </div>
      </footer>
    </main>
  );
}
