"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, PlusCircle } from "lucide-react";

export default function MyPostsPage() {
  const myRequests = useQuery(api.requests.listMyRequests, { limit: 50 });

  return (
    <section className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
            My Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your requests and review incoming proposals.
          </p>
        </div>
        <Button asChild className="rounded-full bg-jade text-white hover:bg-jade/90">
          <Link href="/post">
            <PlusCircle className="mr-2 size-4" />
            New Request
          </Link>
        </Button>
      </div>

      {myRequests === undefined ? (
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
      ) : myRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Post your first request and let developers come to you.
            </p>
            <Button asChild className="mt-2 rounded-full bg-jade text-white hover:bg-jade/90">
              <Link href="/post">Post a Request</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myRequests.map((req) => (
            <Link key={req._id} href={`/my-posts/${req._id}`}>
              <Card className="cursor-pointer transition-colors hover:border-jade/30">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{req.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={req.isOpen ? "default" : "secondary"} className="text-[10px]">
                        {req.isOpen ? "Open" : "Closed"}
                      </Badge>
                      <span className="text-jade font-medium">
                        {req.proposalCount} proposal{req.proposalCount !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
