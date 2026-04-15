import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireViewerUser } from "./lib/auth";

export const listApprovedTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_isApproved_createdAt", (q) => q.eq("isApproved", true))
      .order("desc")
      .take(6);

    return testimonials;
  },
});

export const submitTestimonial = mutation({
  args: {
    quote: v.string(),
    role: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerUser(ctx);

    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError("Rating must be between 1 and 5.");
    }

    if (args.quote.trim().length === 0) {
      throw new ConvexError("Quote cannot be empty.");
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";

    await ctx.db.insert("testimonials", {
      userId: user._id,
      name,
      role: args.role,
      quote: args.quote.trim(),
      rating: Math.round(args.rating),
      isApproved: false,
      createdAt: Date.now(),
    });
  },
});

export const approveTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
  },
  handler: async (ctx, args) => {
    const testimonial = await ctx.db.get(args.testimonialId);
    if (!testimonial) {
      throw new ConvexError("Testimonial not found.");
    }

    await ctx.db.patch(args.testimonialId, { isApproved: true });
  },
});
