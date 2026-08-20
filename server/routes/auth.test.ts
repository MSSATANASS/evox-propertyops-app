import express, { type Express } from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { hashPassword } from "../auth/passwords";
import { openDatabase } from "../db/index";
import { insertUser } from "../db/repositories/users";
import type { AppConfig } from "../types";
import { registerAuthRoutes } from "./auth";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

async function createAuthTestApp(cookieSecure = false): Promise<Express> {
  const db = openDatabase(":memory:");
  databases.push(db);
  const passwordHash = await hashPassword("correct-password");
  insertUser(db, {
    email: "admin@example.com",
    name: "Admin Local",
    role: "admin",
    passwordHash,
  });

  const config: AppConfig = {
    port: 3000,
    databasePath: ":memory:",
    sessionTtlSeconds: 3600,
    cookieSecure,
    nodeEnv: "test",
  };
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  const router = express.Router();
  registerAuthRoutes(router, { db, config });
  app.use(router);
  return app;
}

describe("authentication routes", () => {
  it("logs in, sets a secure cookie policy, and returns the current user", async () => {
    const app = await createAuthTestApp(false);
    const agent = request.agent(app);

    const login = await agent
      .post("/api/auth/login")
      .send({ email: "ADMIN@example.com", password: "correct-password" })
      .expect(200);

    expect(login.body.user).toMatchObject({
      email: "admin@example.com",
      name: "Admin Local",
      role: "admin",
    });
    expect(login.body.user).not.toHaveProperty("passwordHash");
    expect(login.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^propertyops_session=[^;]+; Path=\/; HttpOnly; SameSite=Lax$/,
        ),
      ]),
    );

    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.user).toMatchObject({ email: "admin@example.com" });
  });

  it("adds Secure only when COOKIE_SECURE is enabled", async () => {
    const app = await createAuthTestApp(true);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "correct-password" })
      .expect(200);

    expect(login.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^propertyops_session=[^;]+; Path=\/; HttpOnly; Secure; SameSite=Lax$/,
        ),
      ]),
    );
  });

  it("rejects invalid credentials with a JSON error envelope", async () => {
    const app = await createAuthTestApp();

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "wrong-password" })
      .expect(401);

    expect(response.body).toEqual({ code: "INVALID_CREDENTIALS" });
  });

  it("rejects protected current-user access without a valid session", async () => {
    const app = await createAuthTestApp();

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "propertyops_session=invalid-token")
      .expect(401);

    expect(response.body).toEqual({ code: "UNAUTHENTICATED" });
  });

  it("treats malformed cookie encoding as unauthenticated", async () => {
    const app = await createAuthTestApp();

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "propertyops_session=%")
      .expect(401);

    expect(response.body).toEqual({ code: "UNAUTHENTICATED" });
  });

  it("revokes the cookie session on logout", async () => {
    const app = await createAuthTestApp();
    const agent = request.agent(app);

    await agent
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "correct-password" })
      .expect(200);
    await agent.post("/api/auth/logout").expect(204);

    await agent.get("/api/auth/me").expect(401);
  });
});
