import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    eventId: v.string(),
    areaUrl: v.string(),
    results: v.array(v.object({
      name: v.string(),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      url: v.string(),
      cstt: v.string(),
      instagram: v.optional(v.string()),
      access: v.optional(v.string()),
      businessHours: v.optional(v.string()),
      closedDays: v.optional(v.string()),
      paymentMethods: v.optional(v.string()),
      cutPrice: v.optional(v.string()),
      staffCount: v.optional(v.string()),
      features: v.optional(v.string()),
      remarks: v.optional(v.string()),
      other: v.optional(v.string()),
      queries: v.optional(v.array(v.string()))
    })),
    duration: v.number(),
    totalCount: v.number(),
    csvFileInfo: v.optional(v.object({
      storageId: v.optional(v.string()),
      fileName: v.optional(v.string()),
      recordCount: v.optional(v.number()),
      error: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    const scrapingId = await ctx.db.insert("scraping", {
      eventId: args.eventId,
      areaUrl: args.areaUrl,
      results: args.results,
      duration: args.duration,
      totalCount: args.totalCount,
      csvFileInfo: args.csvFileInfo
    });
    
    return scrapingId;
  },
});

export const getByEventId = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scraping")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first();
  },
});

export const getByAreaUrl = query({
  args: { areaUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scraping")
      .withIndex("by_area_url", (q) => q.eq("areaUrl", args.areaUrl))
      .collect();
  },
});