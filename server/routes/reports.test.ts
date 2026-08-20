import request from "supertest";
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

describe("report routes", () => {
  it("returns dashboard summary counts and recent rows", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);
    const property = createProperty(context.db, {
      name: "Casa Montecristo",
      address: "Calle 21 #304",
      type: "Casa",
      owner: "Arq. Roberto Peniche",
      monthlyRent: 18500,
      status: "ocupado",
    });
    createTask(context.db, {
      propertyId: property.id,
      title: "Revisar bomba",
      description: "Mantenimiento preventivo",
      status: "pendiente",
      priority: "media",
      assignedTo: "Mantenimiento",
    });
    createTask(context.db, {
      propertyId: property.id,
      title: "Cambiar foco",
      description: "Pasillo principal",
      status: "completada",
      priority: "baja",
      assignedTo: "Mantenimiento",
      completedAt: "2026-08-20T00:00:00.000Z",
    });
    createExpense(context.db, {
      propertyId: property.id,
      description: "Compra de foco",
      amount: 250,
      category: "mantenimiento",
      status: "aprobado",
      requestedBy: "Mantenimiento",
      date: "2026-08-20",
    });
    createExpense(context.db, {
      propertyId: property.id,
      description: "Servicio pendiente",
      amount: 100,
      category: "servicios",
      status: "pendiente",
      requestedBy: "Admin",
      date: "2026-08-20",
    });

    const response = await context.agent
      .get("/api/reports/summary")
      .expect(200);
    expect(response.body).toMatchObject({
      counts: {
        properties: 1,
        tasksPending: 1,
        tasksInProgress: 0,
        tasksCompleted: 1,
        expensesApproved: 1,
        expensesPending: 1,
      },
      totals: {
        approvedExpenses: 250,
        pendingExpenses: 100,
      },
    });
    expect(response.body.recentTasks).toHaveLength(2);
    expect(response.body.recentExpenses).toHaveLength(2);
  });

  it("returns a public health response with schema version", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    const response = await request(context.app).get("/api/health").expect(200);
    expect(response.body).toEqual({
      status: "ok",
      version: "test",
      schemaVersion: 1,
    });
  });
});
