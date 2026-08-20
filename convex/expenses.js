import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("expenses").collect();
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    description: v.string(),
    amount: v.number(),
    category: v.string(),
    status: v.string(),
    requestedBy: v.string(),
    approvedBy: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    propertyId: v.id("properties"),
    description: v.string(),
    amount: v.number(),
    category: v.string(),
    status: v.string(),
    requestedBy: v.string(),
    approvedBy: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("expenses"),
    status: v.string(),
    approvedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.approvedBy ? { approvedBy: args.approvedBy } : {}),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
