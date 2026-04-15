"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";
import { ArrowRight, FileText, PlusCircle } from "lucide-react";

export default function MyPostsPage() {
  const myRequests = useQuery(api.requests.listMyRequests, { limit: 50 });

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Posts"
        description="Manage your requests and review incoming proposals."
        action={
          <Button
            asChild
            className="rounded-full bg-jade text-white hover:bg-jade/90"
          >
            <Link href="/post">
              <PlusCircle className="mr-2 size-4" />
              New Request
            </Link>
          </Button>
        }
      />

      {myRequests === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="size-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : myRequests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No posts yet"
          description="Post your first request and let developers come to you."
          action={
            <Button
              asChild
              className="mt-2 rounded-full bg-jade text-white hover:bg-jade/90"
            >
              <Link href="/post">Post a Request</Link>
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
          {myRequests.map((req: any) => (
            <motion.div key={req._id} variants={fadeInUp}>
              <Link href={`/my-posts/${req._id}`}>
                <motion.div whileHover={cardHover}>
                  <Card className="cursor-pointer transition-colors hover:border-jade/30">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold leading-tight">
                          {req.title}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant={req.isOpen ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {req.isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span className="font-medium text-jade">
                            {req.proposalCount} proposal
                            {req.proposalCount !== 1 ? "s" : ""}
                          </span>
                          <span>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
