import type { Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import { requireUser } from "../auth/middleware.js";
import { listExpenses } from "../db/repositories/expenses.js";
import { listProperties } from "../db/repositories/properties.js";
import { listTasks } from "../db/repositories/tasks.js";

export interface ReportRouteDependencies {
  db: DatabaseSync;
}

export function registerReportRoutes(
  router: Router,
  dependencies: ReportRouteDependencies,
): void {
  const { db } = dependencies;
  const authenticated = requireUser(db);

  router.get("/api/reports/summary", authenticated, (_request, response) => {
    const properties = listProperties(db);
    const tasks = listTasks(db);
    const expenses = listExpenses(db);
    const tasksPending = tasks.filter(
      (task) => task.status === "pendiente",
    ).length;
    const tasksInProgress = tasks.filter(
      (task) => task.status === "en_proceso",
    ).length;
    const tasksCompleted = tasks.filter(
      (task) => task.status === "completada",
    ).length;
    const approved = expenses.filter(
      (expense) => expense.status === "aprobado",
    );
    const pending = expenses.filter(
      (expense) => expense.status === "pendiente",
    );

    response.status(200).json({
      counts: {
        properties: properties.length,
        tasksPending,
        tasksInProgress,
        tasksCompleted,
        expensesApproved: approved.length,
        expensesPending: pending.length,
      },
      totals: {
        approvedExpenses: approved.reduce(
          (total, expense) => total + expense.amount,
          0,
        ),
        pendingExpenses: pending.reduce(
          (total, expense) => total + expense.amount,
          0,
        ),
      },
      recentTasks: tasks.slice(-4).reverse(),
      recentExpenses: expenses.slice(-4).reverse(),
    });
  });
}
