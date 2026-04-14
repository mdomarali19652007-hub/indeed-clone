import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewerUser } from "./lib/auth";

// Placeholder module for future custom payment gateway integration
// (bKash, Nagad, Rocket, etc.)
//
// Integration points:
// 1. initiatePayment - called when a poster accepts a proposal and wants to pay
// 2. confirmPayment - called by payment gateway webhook callback
// 3. getPaymentForRequest - check payment status for a request

export const getPaymentForRequest = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return null;

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .unique();

    if (!payment) return null;

    // Only payer or payee can see payment details
    if (payment.payerUserId !== user._id && payment.payeeUserId !== user._id) {
      return null;
    }

    return payment;
  },
});

export const listMyPayments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 50, 200));

    // Get payments where user is payer
    const asPayer = await ctx.db
      .query("payments")
      .withIndex("by_payerUserId", (q) => q.eq("payerUserId", user._id))
      .order("desc")
      .take(limit);

    // Get payments where user is payee
    const asPayee = await ctx.db
      .query("payments")
      .withIndex("by_payeeUserId", (q) => q.eq("payeeUserId", user._id))
      .order("desc")
      .take(limit);

    // Merge and sort by createdAt desc
    const all = [...asPayer, ...asPayee].sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    return all.slice(0, limit);
  },
});
