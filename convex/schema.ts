import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  profiles: defineTable({
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    skills: v.array(v.string()),
    companyName: v.optional(v.string()),
    isDeveloper: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  requests: defineTable({
    postedByUserId: v.id("users"),
    posterName: v.string(),
    companyName: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("bug_fix"),
      v.literal("new_project"),
      v.literal("feature"),
      v.literal("consultation"),
      v.literal("hiring"),
      v.literal("other"),
    ),
    budgetType: v.union(
      v.literal("fixed"),
      v.literal("hourly"),
      v.literal("negotiable"),
    ),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),
    timeline: v.union(
      v.literal("urgent"),
      v.literal("within_a_week"),
      v.literal("within_a_month"),
      v.literal("flexible"),
    ),
    skillsNeeded: v.array(v.string()),
    searchText: v.string(),
    isOpen: v.boolean(),
    proposalCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_postedByUserId", ["postedByUserId"])
    .index("by_isOpen_createdAt", ["isOpen", "createdAt"])
    .index("by_category", ["category"])
    .searchIndex("search_requests", {
      searchField: "searchText",
      filterFields: ["isOpen", "category", "budgetType", "timeline"],
    }),

  proposals: defineTable({
    requestId: v.id("requests"),
    proposerUserId: v.id("users"),
    proposerName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn"),
    ),
    message: v.string(),
    proposedBudget: v.optional(v.number()),
    proposedTimeline: v.optional(v.string()),
    decidedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId_createdAt", ["requestId", "createdAt"])
    .index("by_proposerUserId_createdAt", ["proposerUserId", "createdAt"])
    .index("by_requestId_proposerUserId", ["requestId", "proposerUserId"])
    .index("by_requestId_status", ["requestId", "status"]),

  favorites: defineTable({
    userId: v.id("users"),
    requestId: v.id("requests"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_requestId", ["userId", "requestId"])
    .index("by_requestId", ["requestId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("proposal_received"),
      v.literal("proposal_status"),
      v.literal("request_closed"),
      v.literal("system"),
    ),
    title: v.string(),
    message: v.string(),
    linkUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_userId_isRead_createdAt", ["userId", "isRead", "createdAt"]),

  payments: defineTable({
    requestId: v.id("requests"),
    proposalId: v.id("proposals"),
    payerUserId: v.id("users"),
    payeeUserId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    method: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_payerUserId", ["payerUserId"])
    .index("by_payeeUserId", ["payeeUserId"]),
});
