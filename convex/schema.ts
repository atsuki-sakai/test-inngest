

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
});

