import { mutation } from "../_generated/server";
import { v } from "convex/values";


export const create = mutation({
    args: {
        eventId: v.string(),
        query: v.string(),
        result: v.string(),
        time: v.number(),
        contextJson: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("generate", {
            checked: false,
            eventId: args.eventId,
            query: args.query,
            result: args.result,
            time: args.time,
            contextJson: args.contextJson,
        });
    },
});

export const checkByRunId = mutation({
    args: {
        id: v.id("generate"),
    },
    handler: async (ctx, args) => {

        const generate = await ctx.db.get(args.id);
        if (!generate) {
            throw new Error("Generate not found");
        }
        await ctx.db.patch(generate._id, { checked: true });
    },
});