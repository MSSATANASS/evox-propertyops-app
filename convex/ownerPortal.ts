import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByOwner = query({
  args: { ownerName: v.string() },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query("properties")
      .collect();

    const ownerProperties = properties.filter(
      (p) => p.owner.toLowerCase() === args.ownerName.toLowerCase()
    );

    if (ownerProperties.length === 0) return null;

    const propertyIds = ownerProperties.map((p) => p._id);

    const [allTasks, allExpenses] = await Promise.all([
      ctx.db.query("tasks").collect(),
      ctx.db.query("expenses").collect(),
    ]);

    const tasks = allTasks.filter((t) => propertyIds.includes(t.propertyId));
    const expenses = allExpenses.filter((e) => propertyIds.includes(e.propertyId));

    const totalRent = ownerProperties.reduce((s, p) => s + p.monthlyRent, 0);
    const totalExpensesApproved = expenses
      .filter((e) => e.status === "aprobado")
      .reduce((s, e) => s + e.amount, 0);
    const totalExpensesPending = expenses
      .filter((e) => e.status === "pendiente")
      .reduce((s, e) => s + e.amount, 0);
    const openTasks = tasks.filter((t) => t.status !== "completada").length;
    const completedTasks = tasks.filter((t) => t.status === "completada").length;

    return {
      ownerName: ownerProperties[0].owner,
      properties: ownerProperties,
      tasks,
      expenses,
      summary: {
        totalRent,
        totalExpensesApproved,
        totalExpensesPending,
        openTasks,
        completedTasks,
        netIncome: totalRent - totalExpensesApproved,
      },
    };
  },
});

export const listOwners = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();
    const owners = [...new Set(properties.map((p) => p.owner))];
    return owners.map((owner) => ({
      name: owner,
      slug: encodeURIComponent(owner),
    }));
  },
});
