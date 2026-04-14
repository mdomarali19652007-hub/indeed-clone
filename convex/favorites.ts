import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

export const addFavorite = mutation({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_userId_requestId", (q) =>
        q.eq("userId", user._id).eq("requestId", args.requestId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favorites", {
      userId: user._id,
      requestId: args.requestId,
      createdAt: Date.now(),
    });
  },
});

export const removeFavorite = mutation({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_userId_requestId", (q) =>
        q.eq("userId", user._id).eq("requestId", args.requestId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});

export const isRequestFavorited = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_requestId", (q) =>
        q.eq("userId", user._id).eq("requestId", args.requestId),
      )
      .unique();

    return !!favorite;
  },
});

export const listMyFavorites = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return await Promise.all(
      favorites.map(async (favorite) => {
        const request = await ctx.db.get(favorite.requestId);
        return { ...favorite, request };
      }),
    );
  },
});
