import { afterEach, describe, expect, it } from "vitest";
import { createRouteTestContext } from "../test-utils";
import { createProperty } from "../db/repositories/properties";

const contexts: Awaited<ReturnType<typeof createRouteTestContext>>[] = [];

afterEach(() => {
  for (const context of contexts.splice(0)) {
    context.db.close();
  }
});

describe("expense routes", () => {
  it("creates, filters, and patches approval status transactionally", async () => {
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

    const created = await context.agent
      .post("/api/expenses")
      .send({
        propertyId: property.id,
        description: "Recarga de gas",
        amount: 950,
        category: "mantenimiento",
        status: "pendiente",
        requestedBy: "Técnico Frío Express",
        date: "2026-08-14",
      })
      .expect(201);
    expect(created.body).toMatchObject({
      propertyId: property.id,
      amount: 950,
      status: "pendiente",
    });

    const pending = await context.agent
      .get("/api/expenses")
      .query({ propertyId: String(property.id), status: "pendiente" })
      .expect(200);
    expect(pending.body).toHaveLength(1);

    const updated = await context.agent
      .patch(`/api/expenses/${created.body.id}`)
      .send({ status: "aprobado", approvedBy: "Coordinador Evox" })
      .expect(200);
    expect(updated.body).toMatchObject({
      status: "aprobado",
      approvedBy: "Coordinador Evox",
    });

    const approved = await context.agent
      .get("/api/expenses")
      .query({ status: "aprobado" })
      .expect(200);
    expect(approved.body[0].id).toBe(created.body.id);
  });

  it("rejects invalid expense amounts and unknown properties", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    await context.agent
      .post("/api/expenses")
      .send({
        propertyId: 99,
        description: "Sin propiedad",
        amount: 100,
        category: "servicios",
        status: "pendiente",
        requestedBy: "Admin",
        date: "2026-08-20",
      })
      .expect(404);

    const response = await context.agent
      .post("/api/expenses")
      .send({
        propertyId: 1,
        description: "Monto inválido",
        amount: 0,
        category: "servicios",
        status: "pendiente",
        requestedBy: "Admin",
        date: "2026-08-20",
      })
      .expect(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
