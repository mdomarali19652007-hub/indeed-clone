import { query } from "./_generated/server";

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").collect();
    const requestCount = requests.length;

    const profiles = await ctx.db.query("profiles").collect();
    const developerCount = profiles.filter((p) => p.isDeveloper).length;

    const proposals = await ctx.db.query("proposals").collect();
    const proposalCount = proposals.length;

    const decidedProposals = proposals.filter(
      (p) => p.status === "accepted" || p.status === "rejected",
    );
    const acceptedCount = decidedProposals.filter(
      (p) => p.status === "accepted",
    ).length;
    const satisfactionRate =
      decidedProposals.length > 0
        ? Math.round((acceptedCount / decidedProposals.length) * 100)
        : 0;

    return {
      requestCount,
      developerCount,
      proposalCount,
      satisfactionRate,
    };
  },
});

export const getRecentUserAvatars = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").take(8);

    return users.map((user) => ({
      id: user._id,
      firstName: user.firstName ?? null,
      imageUrl: user.imageUrl ?? null,
    }));
  },
});
