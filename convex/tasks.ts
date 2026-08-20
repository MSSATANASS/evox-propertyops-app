import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    assignedTo: v.string(),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    propertyId: v.id("properties"),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    assignedTo: v.string(),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const completedAt =
      fields.status === "completada" ? new Date().toISOString() : undefined;
    await ctx.db.patch(id, { ...fields, ...(completedAt ? { completedAt } : {}) });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const completedAt =
      args.status === "completada" ? new Date().toISOString() : undefined;
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(completedAt ? { completedAt } : {}),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
