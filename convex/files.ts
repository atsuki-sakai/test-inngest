import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    size: v.number(),
    metadata: v.optional(v.object({
      eventId: v.string(),
      areaUrl: v.string(),
      areaName: v.string(),
      recordCount: v.number(),
      duration: v.number(),
      scrapedAt: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      fileName: args.fileName,
      fileType: args.fileType,
      size: args.size,
      storageId: args.storageId,
      metadata: args.metadata
    });
    
    return fileId;
  },
});

export const getFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .first();
    
    if (!file) {
      return null;
    }
    
    const url = await ctx.storage.getUrl(args.storageId);
    return { ...file, url };
  },
});

export const getDownloadUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      return { success: true, url };
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      return { success: false, error: 'File not found or access denied' };
    }
  },
});

export const listFiles = mutation({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.query("files").order("desc").take(100);
    
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const url = await ctx.storage.getUrl(file.storageId);
          return { ...file, url };
        } catch {
          return { ...file, url: null };
        }
      })
    );
    
    return filesWithUrls;
  },
});