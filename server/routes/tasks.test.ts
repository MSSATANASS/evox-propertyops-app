import { afterEach, describe, expect, it } from "vitest";
import { createRouteTestContext } from "../test-utils";
import { createProperty } from "../db/repositories/properties";

const contexts: Awaited<ReturnType<typeof createRouteTestContext>>[] = [];

afterEach(() => {
  for (const context of contexts.splice(0)) {
    context.db.close();
  }
});

describe("task routes", () => {
  it("creates and filters tasks by status, priority, property, and date", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);
    const property = createProperty(context.db, {
      name: "Depto García Ginerés",
      address: "Av. Pérez Ponce #156",
      type: "Departamento",
      owner: "Lic. Carmen Zavala",
      monthlyRent: 12000,
      status: "ocupado",
    });

    const created = await context.agent
      .post("/api/tasks")
      .send({
        propertyId: property.id,
        title: "Revisar aire acondicionado",
        description: "Revisión y recarga",
        status: "pendiente",
        priority: "alta",
        assignedTo: "Técnico Frío Express",
      })
      .expect(201);

    expect(created.body).toMatchObject({
      propertyId: property.id,
      status: "pendiente",
      priority: "alta",
    });

    const filtered = await context.agent
      .get("/api/tasks")
      .query({
        status: "pendiente",
        priority: "alta",
        propertyId: String(property.id),
        dateFrom: "2000-01-01",
        dateTo: "2999-12-31",
      })
      .expect(200);
    expect(filtered.body).toHaveLength(1);
    expect(filtered.body[0].id).toBe(created.body.id);

    const updated = await context.agent
      .patch(`/api/tasks/${created.body.id}`)
      .send({ status: "completada", completedAt: "2026-08-20T00:00:00.000Z" })
      .expect(200);
    expect(updated.body).toMatchObject({
      status: "completada",
      completedAt: "2026-08-20T00:00:00.000Z",
    });
  });

  it("deletes a task and removes it from the property task list", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);
    const property = createProperty(context.db, {
      name: "Casa para tareas",
      address: "Calle 11",
      type: "Casa",
      owner: "Owner",
      monthlyRent: 1000,
      status: "ocupado",
    });
    const created = await context.agent
      .post("/api/tasks")
      .send({
        propertyId: property.id,
        title: "Tarea para borrar",
        description: "Temporal",
        status: "pendiente",
        priority: "baja",
        assignedTo: "Admin",
      })
      .expect(201);

    await context.agent.delete(`/api/tasks/${created.body.id}`).expect(204);
    await context.agent
      .get("/api/tasks")
      .query({ propertyId: String(property.id) })
      .expect(200)
      .expect([]);
  });

  it("rejects invalid task payloads and unknown properties", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    await context.agent
      .post("/api/tasks")
      .send({
        propertyId: 12345,
        title: "Sin relación",
        description: "Debe fallar por propiedad",
        status: "pendiente",
        priority: "media",
        assignedTo: "Admin",
      })
      .expect(404);

    const response = await context.agent
      .post("/api/tasks")
      .send({ propertyId: "not-a-number", title: "Inválida" })
      .expect(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
