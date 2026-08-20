import type { Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import type { User } from "../db/repositories/users.js";
import { requireUser } from "../auth/middleware.js";
import { listExpenses } from "../db/repositories/expenses.js";
import { listProperties } from "../db/repositories/properties.js";
import { listTasks } from "../db/repositories/tasks.js";
import { forbidden, notFound } from "../validation.js";

export interface OwnerRouteDependencies {
  db: DatabaseSync;
}

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function slugifyOwner(owner: string): string {
  const withoutTitle = owner.replace(/^(?:lic|arq|ing|dr)\.?\s+/i, "");
  return withoutTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ownerMatches(owner: string, requestedSlug: string): boolean {
  const decoded = decodeSlug(requestedSlug);
  return (
    owner.toLowerCase() === decoded.toLowerCase() ||
    encodeURIComponent(owner).toLowerCase() === requestedSlug.toLowerCase() ||
    slugifyOwner(owner) === requestedSlug.toLowerCase()
  );
}

function isOwnerAllowed(
  user: User,
  requestedSlug: string,
  ownerName: string,
): boolean {
  if (user.role !== "owner") {
    return true;
  }
  const configuredSlug = user.ownerSlug?.toLowerCase();
  return (
    configuredSlug === requestedSlug.toLowerCase() ||
    configuredSlug === slugifyOwner(ownerName)
  );
}

export function registerOwnerRoutes(
  router: Router,
  dependencies: OwnerRouteDependencies,
): void {
  const { db } = dependencies;
  const authenticated = requireUser(db);

  router.get(
    "/api/reports/owner/:ownerSlug",
    authenticated,
    (request, response) => {
      const requestedSlugValue = request.params.ownerSlug;
      const requestedSlug = Array.isArray(requestedSlugValue)
        ? requestedSlugValue[0]
        : requestedSlugValue;
      if (
        !isOwnerAllowed(request.user!, requestedSlug, decodeSlug(requestedSlug))
      ) {
        throw forbidden("owner scope violation");
      }
      const properties = listProperties(db).filter((property) =>
        ownerMatches(property.owner, requestedSlug),
      );
      if (properties.length === 0) {
        throw notFound("owner");
      }
      const ownerName = properties[0].owner;

      const propertyIds = new Set(properties.map((property) => property.id));
      const tasks = listTasks(db).filter((task) =>
        propertyIds.has(task.propertyId),
      );
      const expenses = listExpenses(db).filter((expense) =>
        propertyIds.has(expense.propertyId),
      );
      const totalRent = properties.reduce(
        (total, property) => total + property.monthlyRent,
        0,
      );
      const totalExpensesApproved = expenses
        .filter((expense) => expense.status === "aprobado")
        .reduce((total, expense) => total + expense.amount, 0);
      const totalExpensesPending = expenses
        .filter((expense) => expense.status === "pendiente")
        .reduce((total, expense) => total + expense.amount, 0);
      const completedTasks = tasks.filter(
        (task) => task.status === "completada",
      ).length;

      response.status(200).json({
        ownerName,
        properties,
        tasks,
        expenses,
        summary: {
          totalRent,
          totalExpensesApproved,
          totalExpensesPending,
          openTasks: tasks.length - completedTasks,
          completedTasks,
          netIncome: totalRent - totalExpensesApproved,
        },
      });
    },
  );
}
