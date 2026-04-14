import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

export const submitProposal = mutation({
  args: {
    requestId: v.id("requests"),
    message: v.string(),
    proposedBudget: v.optional(v.number()),
    proposedTimeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request || !request.isOpen) {
      throw new ConvexError("This request is no longer open.");
    }

    if (request.postedByUserId === user._id) {
      throw new ConvexError("You cannot propose on your own request.");
    }

    const existing = await ctx.db
      .query("proposals")
      .withIndex("by_requestId_proposerUserId", (q) =>
        q.eq("requestId", args.requestId).eq("proposerUserId", user._id),
      )
      .unique();

    if (existing && existing.status !== "withdrawn") {
      throw new ConvexError("You already submitted a proposal for this request.");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const proposerName = [
      profile?.firstName ?? user.firstName ?? "",
      profile?.lastName ?? user.lastName ?? "",
    ]
      .join(" ")
      .trim() || "Anonymous";

    if (!args.message.trim()) {
      throw new ConvexError("Proposal message cannot be empty.");
    }

    const now = Date.now();

    const proposalId = existing
      ? existing._id
      : await ctx.db.insert("proposals", {
          requestId: args.requestId,
          proposerUserId: user._id,
          proposerName,
          status: "pending",
          message: args.message,
          proposedBudget: args.proposedBudget,
          proposedTimeline: args.proposedTimeline,
          createdAt: now,
          updatedAt: now,
        });

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "pending",
        message: args.message,
        proposedBudget: args.proposedBudget,
        proposedTimeline: args.proposedTimeline,
        updatedAt: now,
      });
    }

    // Increment proposal count
    await ctx.db.patch(args.requestId, {
      proposalCount: request.proposalCount + 1,
      updatedAt: now,
    });

    // Notify the poster
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: request.postedByUserId,
      type: "proposal_received",
      title: "New proposal received",
      message: `${proposerName} submitted a proposal for "${request.title}".`,
      linkUrl: `/my-posts/${args.requestId}`,
      metadata: { proposalId, requestId: args.requestId },
    });

    return proposalId;
  },
});

export const updateProposalStatus = mutation({
  args: {
    proposalId: v.id("proposals"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new ConvexError("Proposal not found.");
    }

    const request = await ctx.db.get(proposal.requestId);
    if (!request || request.postedByUserId !== user._id) {
      throw new ConvexError("You can only manage proposals on your own requests.");
    }

    if (proposal.status !== "pending") {
      throw new ConvexError("This proposal has already been decided.");
    }

    const now = Date.now();
    await ctx.db.patch(args.proposalId, {
      status: args.status,
      decidedAt: now,
      updatedAt: now,
    });

    // Notify the proposer
    const statusLabel = args.status === "accepted" ? "accepted" : "not selected";
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: proposal.proposerUserId,
      type: "proposal_status",
      title: `Proposal ${statusLabel}`,
      message: `Your proposal for "${request.title}" was ${statusLabel}.`,
      linkUrl: `/proposals`,
      metadata: { proposalId: args.proposalId, requestId: request._id },
    });

    // If accepted, optionally close the request
    if (args.status === "accepted") {
      await ctx.db.patch(request._id, {
        isOpen: false,
        closedAt: now,
        updatedAt: now,
      });
    }
  },
});

export const withdrawProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal || proposal.proposerUserId !== user._id) {
      throw new ConvexError("Proposal not found.");
    }
    if (proposal.status !== "pending") {
      throw new ConvexError("Can only withdraw pending proposals.");
    }

    const now = Date.now();
    await ctx.db.patch(args.proposalId, {
      status: "withdrawn",
      updatedAt: now,
    });
  },
});

// --- Queries ---

export const listMyProposals = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_proposerUserId_createdAt", (q) =>
        q.eq("proposerUserId", user._id),
      )
      .order("desc")
      .take(limit);

    return await Promise.all(
      proposals.map(async (proposal) => {
        const request = await ctx.db.get(proposal.requestId);
        return { ...proposal, request };
      }),
    );
  },
});

export const listProposalsForRequest = query({
  args: {
    requestId: v.id("requests"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return [];

    // Only the poster can see proposals for their request
    const request = await ctx.db.get(args.requestId);
    if (!request || request.postedByUserId !== user._id) {
      return [];
    }

    const limit = Math.max(1, Math.min(args.limit ?? 100, 500));
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_requestId_createdAt", (q) =>
        q.eq("requestId", args.requestId),
      )
      .order("desc")
      .take(limit);

    return await Promise.all(
      proposals.map(async (proposal) => {
        const proposer = await ctx.db.get(proposal.proposerUserId);
        const profile = proposer
          ? await ctx.db
              .query("profiles")
              .withIndex("by_userId", (q) => q.eq("userId", proposer._id))
              .unique()
          : null;
        return { ...proposal, proposer, profile };
      }),
    );
  },
});
