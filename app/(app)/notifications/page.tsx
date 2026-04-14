"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  CheckCheck,
  FileText,
  Info,
  Send,
  XCircle,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { getErrorMessage } from "@/lib/convex-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NotificationType =
  | "proposal_received"
  | "proposal_status"
  | "request_closed"
  | "system";

function formatRelativeTime(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getNotificationIcon(
  type: NotificationType,
  metadata?: Record<string, unknown>,
) {
  switch (type) {
    case "proposal_received":
      return <Send className="size-5 text-blue-500" />;
    case "proposal_status": {
      const status = metadata?.status as string | undefined;
      if (status === "accepted")
        return <CheckCheck className="size-5 text-emerald-500" />;
      if (status === "rejected")
        return <XCircle className="size-5 text-red-400" />;
      return <FileText className="size-5 text-amber-500" />;
    }
    case "request_closed":
      return <XCircle className="size-5 text-muted-foreground" />;
    case "system":
    default:
      return <Info className="size-5 text-muted-foreground" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useQuery(api.notifications.listMyNotifications, {
    limit: 50,
  });
  const markRead = useMutation(api.notifications.markNotificationRead);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const unreadCount =
    useQuery(api.notifications.getUnreadNotificationCount) ?? 0;

  const handleClick = async (
    id: Id<"notifications">,
    linkUrl?: string,
    isRead?: boolean,
  ) => {
    try {
      if (!isRead) {
        await markRead({ notificationId: id });
      }
      if (linkUrl) {
        router.push(linkUrl);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated on your requests and proposals.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleMarkAll}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-2 p-5">
                <div className="h-4 w-2/3 rounded bg-secondary" />
                <div className="h-3 w-full rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">
              You will be notified when someone sends a proposal or responds to yours.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`cursor-pointer transition-colors hover:border-jade/30 ${
                !n.isRead ? "border-jade/20 bg-jade/5" : ""
              }`}
              onClick={() => handleClick(n._id, n.linkUrl, n.isRead)}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(
                    n.type as NotificationType,
                    n.metadata as Record<string, unknown> | undefined,
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="mt-2 size-2.5 shrink-0 rounded-full bg-jade" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
