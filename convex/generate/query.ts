import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByEventId = query({
    args: {
        eventId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("generate").withIndex("by_event_id", (q) => q.eq("eventId", args.eventId)).first();
    },
});
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("generate").order("desc").collect();
    },
});