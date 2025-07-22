import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
    args: {
        eventId: v.string(),
        taskType: v.union(v.literal("sns_generation"), v.literal("scraping")),
        totalSteps: v.number(),
        stepDefinitions: v.array(v.object({
            stepId: v.string(),
            name: v.string()
        })),
        metadata: v.optional(v.object({
            platform: v.optional(v.string()),
            areaUrl: v.optional(v.string()),
            areaName: v.optional(v.string()),
            prompt: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        // 既存のタスクをチェック（冪等性を保証）
        const existingTask = await ctx.db
            .query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();

        if (existingTask) {
            // 既に存在する場合は何もしない（重複作成を防止）
            console.log(`Task already exists for eventId: ${args.eventId}`);
            return;
        }

        const stepDetails = args.stepDefinitions.map(step => ({
            stepId: step.stepId,
            name: step.name,
            status: "pending" as const,
            startTime: undefined,
            endTime: undefined,
            error: undefined
        }));

        await ctx.db.insert("task", {
            eventId: args.eventId,
            taskType: args.taskType,
            status: "pending",
            currentStep: 0,
            totalSteps: args.totalSteps,
            stepDetails,
            metadata: args.metadata,
            createdAt: Date.now()
        });
    }
});

export const updateStep = mutation({
    args: {
        eventId: v.string(),
        stepId: v.string(),
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
        error: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
            
        if (!task) {
            throw new Error("Task not found");
        }

        const updatedStepDetails = task.stepDetails.map(step => {
            if (step.stepId === args.stepId) {
                const updatedStep = {
                    ...step,
                    status: args.status,
                    error: args.error
                };

                if (args.status === "in_progress" && !step.startTime) {
                    updatedStep.startTime = Date.now();
                }
                if ((args.status === "completed" || args.status === "failed") && !step.endTime) {
                    updatedStep.endTime = Date.now();
                }

                return updatedStep;
            }
            return step;
        });

        // 現在のステップ番号を計算
        const currentStepIndex = updatedStepDetails.findIndex(step => 
            step.status === "in_progress" || step.status === "pending"
        );
        const currentStep = currentStepIndex === -1 ? task.totalSteps : currentStepIndex + 1;

        // タスク全体のステータスを更新
        let taskStatus = task.status;
        if (args.status === "failed") {
            taskStatus = "failed";
        } else if (args.status === "in_progress" && taskStatus === "pending") {
            taskStatus = "in_progress";
        } else if (updatedStepDetails.every(step => step.status === "completed")) {
            taskStatus = "completed";
        }

        await ctx.db.patch(task._id, {
            stepDetails: updatedStepDetails,
            currentStep,
            status: taskStatus
        });
    }
});

export const updateTaskStatus = mutation({
    args: {
        eventId: v.string(),
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed"))
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
            
        if (!task) {
            throw new Error("Task not found");
        }

        await ctx.db.patch(task._id, {
            status: args.status
        });
    }
});

export const deleteTask = mutation({
    args: {
        eventId: v.string()
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
            
        if (!task) {
            throw new Error("Task not found");
        }

        await ctx.db.delete(task._id);
    }
});

export const deleteTaskById = mutation({
    args: {
        id: v.id("task")
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    }
});

export const completeTask = mutation({
    args: {
        eventId: v.string(),
        success: v.boolean(),
        error: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
            
        if (!task) {
            throw new Error("Task not found");
        }

        const finalStatus: "completed" | "failed" = args.success ? "completed" : "failed";
        
        // 未完了のステップも終了としてマーク
        const updatedStepDetails = task.stepDetails.map(step => {
            if (step.status === "pending" || step.status === "in_progress") {
                return {
                    ...step,
                    status: finalStatus as "pending" | "in_progress" | "completed" | "failed",
                    endTime: Date.now(),
                    error: args.success ? undefined : (args.error || "Task failed")
                };
            }
            return step;
        });

        await ctx.db.patch(task._id, {
            status: finalStatus,
            stepDetails: updatedStepDetails,
            currentStep: task.totalSteps
        });
    }
});