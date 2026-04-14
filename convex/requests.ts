import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

const categoryValidator = v.union(
  v.literal("bug_fix"),
  v.literal("new_project"),
  v.literal("feature"),
  v.literal("consultation"),
  v.literal("hiring"),
  v.literal("other"),
);

const budgetTypeValidator = v.union(
  v.literal("fixed"),
  v.literal("hourly"),
  v.literal("negotiable"),
);

const timelineValidator = v.union(
  v.literal("urgent"),
  v.literal("within_a_week"),
  v.literal("within_a_month"),
  v.literal("flexible"),
);

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildSearchText(input: {
  title: string;
  description: string;
  posterName: string;
  companyName?: string;
  skillsNeeded: string[];
}) {
  return [
    input.title,
    stripHtml(input.description),
    input.posterName,
    input.companyName ?? "",
    input.skillsNeeded.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function normalizeSkills(skills?: string[]) {
  return (skills ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

// --- Mutations ---

export const createRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    budgetType: budgetTypeValidator,
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),
    timeline: timelineValidator,
    skillsNeeded: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const posterName = [
      profile?.firstName ?? user.firstName ?? "",
      profile?.lastName ?? user.lastName ?? "",
    ]
      .join(" ")
      .trim();

    if (!posterName) {
      throw new ConvexError("Please complete your profile before posting.");
    }

    if (args.budgetMin !== undefined && args.budgetMax !== undefined && args.budgetMin > args.budgetMax) {
      throw new ConvexError("Minimum budget cannot be greater than maximum.");
    }

    const skillsNeeded = normalizeSkills(args.skillsNeeded);
    const now = Date.now();

    return await ctx.db.insert("requests", {
      postedByUserId: user._id,
      posterName,
      companyName: profile?.companyName,
      title: args.title,
      description: args.description,
      category: args.category,
      budgetType: args.budgetType,
      budgetMin: args.budgetMin,
      budgetMax: args.budgetMax,
      budgetCurrency: args.budgetCurrency ?? "BDT",
      timeline: args.timeline,
      skillsNeeded,
      searchText: buildSearchText({
        title: args.title,
        description: args.description,
        posterName,
        companyName: profile?.companyName,
        skillsNeeded,
      }),
      isOpen: true,
      proposalCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRequest = mutation({
  args: {
    requestId: v.id("requests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
    budgetType: v.optional(budgetTypeValidator),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),
    timeline: v.optional(timelineValidator),
    skillsNeeded: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request || request.postedByUserId !== user._id) {
      throw new ConvexError("Request not found.");
    }
    if (!request.isOpen) {
      throw new ConvexError("Cannot edit a closed request.");
    }

    const { requestId, ...updates } = args;
    const skillsNeeded = updates.skillsNeeded
      ? normalizeSkills(updates.skillsNeeded)
      : undefined;

    const title = updates.title ?? request.title;
    const description = updates.description ?? request.description;

    const now = Date.now();
    await ctx.db.patch(requestId, {
      ...updates,
      ...(skillsNeeded !== undefined ? { skillsNeeded } : {}),
      searchText: buildSearchText({
        title,
        description,
        posterName: request.posterName,
        companyName: request.companyName,
        skillsNeeded: skillsNeeded ?? request.skillsNeeded,
      }),
      updatedAt: now,
    });
  },
});

export const closeRequest = mutation({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request || request.postedByUserId !== user._id) {
      throw new ConvexError("Request not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      isOpen: false,
      closedAt: now,
      updatedAt: now,
    });
  },
});

// --- Queries ---

export const getRequestById = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const poster = await ctx.db.get(request.postedByUserId);
    return { ...request, poster };
  },
});

export const listOpenRequests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 30, 100));
    return await ctx.db
      .query("requests")
      .withIndex("by_isOpen_createdAt", (q) => q.eq("isOpen", true))
      .order("desc")
      .take(limit);
  },
});

export const searchRequests = query({
  args: {
    searchText: v.optional(v.string()),
    category: v.optional(categoryValidator),
    budgetType: v.optional(budgetTypeValidator),
    timeline: v.optional(timelineValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 30, 100));

    if (args.searchText && args.searchText.trim().length > 0) {
      let searchQuery = ctx.db
        .query("requests")
        .withSearchIndex("search_requests", (q) => {
          let sq = q.search("searchText", args.searchText!).eq("isOpen", true);
          if (args.category) sq = sq.eq("category", args.category);
          if (args.budgetType) sq = sq.eq("budgetType", args.budgetType);
          if (args.timeline) sq = sq.eq("timeline", args.timeline);
          return sq;
        });

      return await searchQuery.take(limit);
    }

    // No search text: use index-based listing with in-memory filters
    const candidates = await ctx.db
      .query("requests")
      .withIndex("by_isOpen_createdAt", (q) => q.eq("isOpen", true))
      .order("desc")
      .take(limit * 3); // over-fetch for in-memory filtering

    const filtered = candidates.filter((r) => {
      if (args.category && r.category !== args.category) return false;
      if (args.budgetType && r.budgetType !== args.budgetType) return false;
      if (args.timeline && r.timeline !== args.timeline) return false;
      return true;
    });

    return filtered.slice(0, limit);
  },
});

export const listMyRequests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
    return await ctx.db
      .query("requests")
      .withIndex("by_postedByUserId", (q) => q.eq("postedByUserId", user._id))
      .order("desc")
      .take(limit);
  },
});
