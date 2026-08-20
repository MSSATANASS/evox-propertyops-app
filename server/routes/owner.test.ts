import { afterEach, describe, expect, it } from "vitest";
import { createRouteTestContext } from "../test-utils";
import { createProperty } from "../db/repositories/properties";
import { createTask } from "../db/repositories/tasks";
import { createExpense } from "../db/repositories/expenses";

const contexts: Awaited<ReturnType<typeof createRouteTestContext>>[] = [];

afterEach(() => {
  for (const context of contexts.splice(0)) {
    context.db.close();
  }
});

function addOwnerData(
  db: ReturnType<typeof createRouteTestContext> extends Promise<infer T>
    ? T extends { db: infer D }
      ? D
      : never
    : never,
) {
  const property = createProperty(db, {
    name: "Depto García Ginerés",
    address: "Av. Pérez Ponce #156",
    type: "Departamento",
    owner: "Lic. Carmen Zavala",
    monthlyRent: 12000,
    status: "ocupado",
  });
  createTask(db, {
    propertyId: property.id,
    title: "Revisar aire",
    description: "Mantenimiento",
    status: "pendiente",
    priority: "alta",
    assignedTo: "Técnico",
  });
  createExpense(db, {
    propertyId: property.id,
    description: "Recarga",
    amount: 950,
    category: "mantenimiento",
    status: "aprobado",
    requestedBy: "Técnico",
    date: "2026-08-20",
  });
  return property;
}

describe("owner report routes", () => {
  it("returns the owner-scoped property, task, expense, and summary", async () => {
    const context = await createRouteTestContext({
      role: "owner",
      ownerSlug: "carmen-zavala",
      email: "carmen@example.com",
    });
    contexts.push(context);
    addOwnerData(context.db);
    createProperty(context.db, {
      name: "Casa de Otro Dueño",
      address: "Calle 60 #1",
      type: "Casa",
      owner: "Otro Propietario",
      monthlyRent: 20000,
      status: "ocupado",
    });

    const response = await context.agent
      .get("/api/reports/owner/carmen-zavala")
      .expect(200);
    expect(response.body).toMatchObject({
      ownerName: "Lic. Carmen Zavala",
      summary: {
        totalRent: 12000,
        totalExpensesApproved: 950,
        totalExpensesPending: 0,
        openTasks: 1,
        completedTasks: 0,
        netIncome: 11050,
      },
    });
    expect(response.body.properties).toHaveLength(1);
    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.expenses).toHaveLength(1);
  });

  it("returns 403 when an owner requests another owner's data", async () => {
    const context = await createRouteTestContext({
      role: "owner",
      ownerSlug: "carmen-zavala",
      email: "carmen@example.com",
    });
    contexts.push(context);
    addOwnerData(context.db);

    const response = await context.agent
      .get("/api/reports/owner/otro-propietario")
      .expect(403);
    expect(response.body).toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns 404 for a missing owner", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    await context.agent.get("/api/reports/owner/missing-owner").expect(404);
  });
});
