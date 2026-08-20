import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { DatabaseSync } from "node:sqlite";
import { findSessionUser } from "./sessions.js";

export const SESSION_COOKIE_NAME = "propertyops_session";

declare global {
  namespace Express {
    interface Request {
      user?: import("../db/repositories/users.js").User;
    }
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function requireUser(db: DatabaseSync): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const token = readCookie(request, SESSION_COOKIE_NAME);
    const user = token ? findSessionUser(db, token) : null;

    if (!user) {
      response.status(401).json({ code: "UNAUTHENTICATED" });
      return;
    }

    request.user = user;
    next();
  };
}

export function sessionTokenFromRequest(request: Request): string | null {
  return readCookie(request, SESSION_COOKIE_NAME);
}
