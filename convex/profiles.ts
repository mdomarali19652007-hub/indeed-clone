import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getViewerUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return { user, profile };
  },
});

export const getPublicProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return { user, profile };
  },
});

export const upsertMyProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    companyName: v.optional(v.string()),
    isDeveloper: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();
    const normalizedSkills = (args.skills ?? [])
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      const profileId = await ctx.db.insert("profiles", {
        userId: user._id,
        firstName: args.firstName,
        lastName: args.lastName,
        headline: args.headline,
        bio: args.bio,
        location: args.location,
        phone: args.phone,
        website: args.website,
        githubUrl: args.githubUrl,
        skills: normalizedSkills,
        companyName: args.companyName,
        isDeveloper: args.isDeveloper ?? false,
        updatedAt: now,
      });
      return await ctx.db.get(profileId);
    }

    await ctx.db.patch(existing._id, {
      firstName: args.firstName ?? undefined,
      lastName: args.lastName ?? undefined,
      headline: args.headline ?? undefined,
      bio: args.bio ?? undefined,
      location: args.location ?? undefined,
      phone: args.phone ?? undefined,
      website: args.website ?? undefined,
      githubUrl: args.githubUrl ?? undefined,
      skills: normalizedSkills.length > 0 ? normalizedSkills : existing.skills,
      companyName: args.companyName ?? undefined,
      isDeveloper: args.isDeveloper ?? existing.isDeveloper,
      updatedAt: now,
    });

    return await ctx.db.get(existing._id);
  },
});
