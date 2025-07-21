

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    generate: defineTable({
        checked: v.optional(v.boolean()), // 生成結果が確認されたかどうか
        eventId: v.string(), // InngestのeventId
        query: v.string(), // ユーザーの入力
        result: v.string(), // 生成結果
        time: v.number(), // 生成にかかった時間
    })
    .index("by_event_id", ["eventId"]),
    
    files: defineTable({
        fileName: v.string(),
        fileType: v.string(),
        size: v.number(),
        storageId: v.string(),
        metadata: v.optional(v.object({
            eventId: v.string(),
            areaUrl: v.string(),
            recordCount: v.number(),
            duration: v.number(),
            scrapedAt: v.string()
        }))
    })
    .index("by_storage_id", ["storageId"]),
    
    scraping: defineTable({
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
            other: v.optional(v.string())
        })),
        duration: v.number(),
        totalCount: v.number(),
        csvFileInfo: v.optional(v.object({
            storageId: v.optional(v.string()),
            fileName: v.optional(v.string()),
            recordCount: v.optional(v.number()),
            error: v.optional(v.string())
        }))
    })
    .index("by_event_id", ["eventId"])
    .index("by_area_url", ["areaUrl"]),
});

