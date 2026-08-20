import { createHash, randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { findUserById, type User } from "../db/repositories/users.js";

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createSession(
  db: DatabaseSync,
  userId: number,
  ttlSeconds: number,
  now = new Date(),
): string {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

  db.prepare(
    "INSERT INTO sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).run(userId, tokenHash, expiresAt, createdAt);

  return token;
}

export function findSessionUser(
  db: DatabaseSync,
  token: string,
  now = new Date(),
): User | null {
  const tokenHash = hashToken(token);
  const row = db
    .prepare(
      "SELECT id, user_id, expires_at FROM sessions WHERE token_hash = ? AND revoked_at IS NULL",
    )
    .get(tokenHash) as
    { id: number; user_id: number; expires_at: string } | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at <= now.toISOString()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(row.id);
    return null;
  }

  return findUserById(db, Number(row.user_id));
}

export function revokeSession(db: DatabaseSync, token: string): void {
  db.prepare(
    "UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
  ).run(new Date().toISOString(), hashToken(token));
}
