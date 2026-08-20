import express from "express";
import request, { type Agent } from "supertest";
import { hashPassword } from "./auth/passwords.js";
import { openDatabase } from "./db/index.js";
import { insertUser, type User } from "./db/repositories/users.js";
import { createApp } from "./app.js";
import type { AppConfig } from "./types.js";

export interface RouteTestContext {
  app: express.Express;
  agent: Agent;
  db: ReturnType<typeof openDatabase>;
  user: User;
}

export async function createRouteTestContext(
  options: {
    role?: string;
    ownerSlug?: string | null;
    email?: string;
  } = {},
): Promise<RouteTestContext> {
  const db = openDatabase(":memory:");
  const passwordHash = await hashPassword("test-password");
  const user = insertUser(db, {
    email: options.email ?? "manager@example.com",
    name: options.role === "owner" ? "Carmen Zavala" : "Manager Local",
    role: options.role ?? "manager",
    ownerSlug: options.ownerSlug ?? null,
    passwordHash,
  });
  const config: AppConfig = {
    port: 3000,
    databasePath: ":memory:",
    sessionTtlSeconds: 3600,
    cookieSecure: false,
    nodeEnv: "test",
  };
  const app = createApp({ db, config, version: "test" });
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ email: user.email, password: "test-password" })
    .expect(200);

  return { app, agent, db, user };
}

export function unauthenticatedApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  return app;
}
