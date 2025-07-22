

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    generate: defineTable({
        checked: v.optional(v.boolean()), // 生成結果が確認されたかどうか
        eventId: v.string(), // InngestのeventId
        query: v.string(), // ユーザーの入力
        result: v.string(), // 生成結果
        time: v.number(), // 生成にかかった時間
        contextJson: v.optional(v.string()), // 生成途中の結果
        // 生成パラメータ
        platform: v.optional(v.string()), // プラットフォーム
        targetAudience: v.optional(v.string()), // ターゲット層
        postType: v.optional(v.string()), // 投稿タイプ
        keywords: v.optional(v.string()), // キーワード
        frameworks: v.optional(v.array(v.string())), // 使用したフレームワーク
        createdAt: v.optional(v.number()), // 作成日時
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
            areaName: v.string(),
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
    })
    .index("by_event_id", ["eventId"])
    .index("by_area_url", ["areaUrl"]),
    
    task: defineTable({
        eventId: v.string(),
        taskType: v.union(v.literal("sns_generation"), v.literal("scraping")),
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
        currentStep: v.number(),
        totalSteps: v.number(),
        stepDetails: v.array(v.object({
            stepId: v.string(),
            name: v.string(),
            status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
            startTime: v.optional(v.number()),
            endTime: v.optional(v.number()),
            error: v.optional(v.string())
        })),
        metadata: v.optional(v.object({
            platform: v.optional(v.string()),
            areaUrl: v.optional(v.string()),
            areaName: v.optional(v.string()),
            prompt: v.optional(v.string())
        })),
        createdAt: v.number()
    })
    .index("by_event_id", ["eventId"])
    .index("by_status", ["status"])
    .index("by_task_type", ["taskType"]),
});

