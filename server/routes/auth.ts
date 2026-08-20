import type { Request, Response, Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import { verifyPassword } from "../auth/passwords.js";
import {
  requireUser,
  SESSION_COOKIE_NAME,
  sessionTokenFromRequest,
} from "../auth/middleware.js";
import { createSession, revokeSession } from "../auth/sessions.js";
import { findUserByEmail, type User } from "../db/repositories/users.js";
import type { AppConfig } from "../types.js";

export interface AuthRouteDependencies {
  db: DatabaseSync;
  config: Pick<AppConfig, "sessionTtlSeconds" | "cookieSecure">;
}

function publicUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function setSessionCookie(
  response: Response,
  token: string,
  secure: boolean,
): void {
  response.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

function clearSessionCookie(response: Response, secure: boolean): void {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

function loginBody(
  request: Request,
): { email: string; password: string } | null {
  const body = request.body as unknown;
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Record<string, unknown>;
  if (
    typeof candidate.email !== "string" ||
    typeof candidate.password !== "string"
  ) {
    return null;
  }

  const email = candidate.email.trim().toLowerCase();
  const password = candidate.password;
  return email && password ? { email, password } : null;
}

export function registerAuthRoutes(
  router: Router,
  dependencies: AuthRouteDependencies,
): void {
  const { db, config } = dependencies;

  router.post("/api/auth/login", async (request, response) => {
    const credentials = loginBody(request);
    if (!credentials) {
      response.status(400).json({ code: "INVALID_REQUEST" });
      return;
    }

    const user = findUserByEmail(db, credentials.email);
    if (
      !user ||
      !(await verifyPassword(credentials.password, user.passwordHash))
    ) {
      response.status(401).json({ code: "INVALID_CREDENTIALS" });
      return;
    }

    const token = createSession(db, user.id, config.sessionTtlSeconds);
    setSessionCookie(response, token, config.cookieSecure);
    response.status(200).json({ user: publicUser(user) });
  });

  router.post("/api/auth/logout", (request, response) => {
    const token = sessionTokenFromRequest(request);
    if (token) {
      revokeSession(db, token);
    }

    clearSessionCookie(response, config.cookieSecure);
    response.status(204).send();
  });

  router.get("/api/auth/me", requireUser(db), (request, response) => {
    response.status(200).json({ user: publicUser(request.user!) });
  });
}
