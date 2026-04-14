"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Heart, PlusCircle, Search, Send, FileText } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { SiteLogo } from "@/components/site-logo";

const navItems = [
  { href: "/requests", label: "Browse", icon: Search },
  { href: "/post", label: "Post a Request", icon: PlusCircle },
  { href: "/my-posts", label: "My Posts", icon: FileText },
  { href: "/proposals", label: "My Proposals", icon: Send },
  { href: "/favorites", label: "Saved", icon: Heart },
];

const mobileNavItems = [
  { href: "/requests", label: "Browse", icon: Search },
  { href: "/post", label: "Post", icon: PlusCircle },
  { href: "/my-posts", label: "Posts", icon: FileText },
  { href: "/proposals", label: "Proposals", icon: Send },
  { href: "/favorites", label: "Saved", icon: Heart },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-2.5">
          <SiteLogo />

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-jade text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
            <div className="ml-2">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-6">{children}</div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-jade"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
