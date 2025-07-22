import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAllTasks = query({
    args: {
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed"))
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("task")
            .withIndex("by_status", q => q.eq("status", args.status))
            .order("desc")
            .collect();
    }
});

export const getActiveTasks = query({
    args: {},
    handler: async (ctx) => {
        // 進行中または保留中のタスクのみ取得
        const tasks = await ctx.db.query("task").collect();
        return tasks.filter(task => 
            task.status === "in_progress" || task.status === "pending"
        ).sort((a, b) => b.createdAt - a.createdAt);
    }
});

export const getTaskByEventId = query({
    args: {
        eventId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
    }
});

export const getTasksByType = query({
    args: {
        taskType: v.union(v.literal("sns_generation"), v.literal("scraping"))
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("task")
            .withIndex("by_task_type", q => q.eq("taskType", args.taskType))
            .order("desc")
            .collect();
    }
});

export const getTasksByStatus = query({
    args: {
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed"))
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("task")
            .withIndex("by_status", q => q.eq("status", args.status))
            .order("desc")
            .collect();
    }
});

export const getCompletedTasks = query({
    args: {},
    handler: async (ctx) => {
        const tasks = await ctx.db.query("task").collect();
        return tasks.filter(task => 
            task.status === "completed" || task.status === "failed"
        ).sort((a, b) => b.createdAt - a.createdAt);
    }
});

export const getTaskProgress = query({
    args: {
        eventId: v.string()
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.query("task")
            .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
            .first();
            
        if (!task) {
            return null;
        }

        const completedSteps = task.stepDetails.filter(step => step.status === "completed").length;
        const failedSteps = task.stepDetails.filter(step => step.status === "failed").length;
        const inProgressSteps = task.stepDetails.filter(step => step.status === "in_progress").length;
        
        const progressPercentage = Math.round((completedSteps / task.totalSteps) * 100);
        
        const duration = task.stepDetails.reduce((total, step) => {
            if (step.startTime && step.endTime) {
                return total + (step.endTime - step.startTime);
            }
            return total;
        }, 0);

        return {
            ...task,
            progressPercentage,
            completedSteps,
            failedSteps,
            inProgressSteps,
            duration
        };
    }
});

export const getTaskStats = query({
    args: {},
    handler: async (ctx) => {
        const tasks = await ctx.db.query("task").collect();
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        const failedTasks = tasks.filter(t => t.status === "failed").length;
        const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
        const pendingTasks = tasks.filter(t => t.status === "pending").length;
        
        const snsGenerationTasks = tasks.filter(t => t.taskType === "sns_generation").length;
        const scrapingTasks = tasks.filter(t => t.taskType === "scraping").length;

        return {
            totalTasks,
            completedTasks,
            failedTasks,
            inProgressTasks,
            pendingTasks,
            snsGenerationTasks,
            scrapingTasks
        };
    }
});