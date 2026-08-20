import type { Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import { runAuditedMutation } from "../audit.js";
import { requireUser } from "../auth/middleware.js";
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from "../db/repositories/expenses.js";
import { getProperty } from "../db/repositories/properties.js";
import {
  expenseCreateSchema,
  expenseQuerySchema,
  expenseUpdateSchema,
  idParamSchema,
  notFound,
  parse,
} from "../validation.js";

export interface ExpenseRouteDependencies {
  db: DatabaseSync;
}

export function registerExpenseRoutes(
  router: Router,
  dependencies: ExpenseRouteDependencies,
): void {
  const { db } = dependencies;
  const authenticated = requireUser(db);

  router.get("/api/expenses", authenticated, (request, response) => {
    const filters = parse(expenseQuerySchema, request.query);
    response.status(200).json(listExpenses(db, filters));
  });

  router.post("/api/expenses", authenticated, (request, response) => {
    const input = parse(expenseCreateSchema, request.body);
    if (!getProperty(db, input.propertyId)) {
      throw notFound("property");
    }
    const expense = runAuditedMutation(
      db,
      request.user!.id,
      "create",
      "expense",
      () => createExpense(db, input),
      (result) => result.id,
    );
    response.status(201).json(expense);
  });

  router.patch("/api/expenses/:id", authenticated, (request, response) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(expenseUpdateSchema, request.body);
    if (input.propertyId !== undefined && !getProperty(db, input.propertyId)) {
      throw notFound("property");
    }
    if (!getExpense(db, id)) {
      throw notFound("expense");
    }
    const expense = runAuditedMutation(
      db,
      request.user!.id,
      "update",
      "expense",
      () => {
        const result = updateExpense(db, id, input);
        if (!result) {
          throw notFound("expense");
        }
        return result;
      },
      (result) => result.id,
    );
    response.status(200).json(expense);
  });

  router.delete("/api/expenses/:id", authenticated, (request, response) => {
    const { id } = parse(idParamSchema, request.params);
    runAuditedMutation(
      db,
      request.user!.id,
      "delete",
      "expense",
      () => {
        if (!deleteExpense(db, id)) {
          throw notFound("expense");
        }
        return id;
      },
      (result) => result,
    );
    response.status(204).send();
  });
}
