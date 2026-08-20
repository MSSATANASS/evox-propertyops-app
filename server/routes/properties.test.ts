import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createRouteTestContext } from "../test-utils";

const contexts: Awaited<ReturnType<typeof createRouteTestContext>>[] = [];

afterEach(() => {
  for (const context of contexts.splice(0)) {
    context.db.close();
  }
});

describe("property routes", () => {
  it("lists, creates, patches, and persists a property", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    expect(
      await context.agent.get("/api/properties").expect(200),
    ).toMatchObject({
      body: [],
    });

    const created = await context.agent
      .post("/api/properties")
      .send({
        name: "Casa Montecristo",
        address: "Calle 21 #304",
        type: "Casa",
        owner: "Arq. Roberto Peniche",
        monthlyRent: 18500,
        status: "ocupado",
      })
      .expect(201);

    expect(created.body).toMatchObject({
      name: "Casa Montecristo",
      monthlyRent: 18500,
    });

    const patched = await context.agent
      .patch(`/api/properties/${created.body.id}`)
      .send({ status: "desocupado" })
      .expect(200);
    expect(patched.body.status).toBe("desocupado");

    const listed = await context.agent.get("/api/properties").expect(200);
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toMatchObject({
      id: created.body.id,
      status: "desocupado",
    });
    expect(
      (
        context.db
          .prepare("SELECT COUNT(*) AS count FROM audit_events")
          .get() as { count: number }
      ).count,
    ).toBe(2);
  });

  it("returns a validation error for an incomplete property", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    const response = await context.agent
      .post("/api/properties")
      .send({ name: "Sin dirección", monthlyRent: -1 })
      .expect(400);

    expect(response.body).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects request bodies above the configured limit", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    const response = await context.agent
      .post("/api/properties")
      .send({
        name: "x".repeat(120_000),
        address: "Calle 1",
        type: "Casa",
        owner: "Owner",
        monthlyRent: 1000,
        status: "ocupado",
      })
      .expect(413);

    expect(response.body).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
  });

  it("requires a session and reports missing properties", async () => {
    const context = await createRouteTestContext();
    contexts.push(context);

    await request(context.app).get("/api/properties").expect(401);
    await context.agent
      .patch("/api/properties/999")
      .send({ status: "ocupado" })
      .expect(404);
  });
});
