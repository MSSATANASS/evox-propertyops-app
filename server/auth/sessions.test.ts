import { afterEach, describe, expect, it } from "vitest";
import { openDatabase } from "../db/index";
import { insertUser } from "../db/repositories/users";
import { createSession, findSessionUser, revokeSession } from "./sessions";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

function createTestUser(db: ReturnType<typeof openDatabase>) {
  return insertUser(db, {
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
    passwordHash: "test-password-hash",
  });
}

describe("session persistence", () => {
  it("stores only a one-way token hash and resolves the raw token to its user", () => {
    const db = openDatabase(":memory:");
    databases.push(db);
    const user = createTestUser(db);

    const token = createSession(db, user.id, 3600);
    const stored = db
      .prepare("SELECT token_hash FROM sessions WHERE user_id = ?")
      .get(user.id) as { token_hash: string };

    expect(token).toHaveLength(64);
    expect(stored.token_hash).not.toBe(token);
    expect(stored.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(findSessionUser(db, token)).toMatchObject({ id: user.id });
  });

  it("deletes expired sessions during lookup", () => {
    const db = openDatabase(":memory:");
    databases.push(db);
    const user = createTestUser(db);
    const issuedAt = new Date("2026-08-20T12:00:00.000Z");

    const token = createSession(db, user.id, 60, issuedAt);

    expect(
      findSessionUser(db, token, new Date("2026-08-20T12:01:01.000Z")),
    ).toBeNull();
    expect(
      (
        db.prepare("SELECT COUNT(*) AS count FROM sessions").get() as {
          count: number;
        }
      ).count,
    ).toBe(0);
  });

  it("revokes a session so subsequent lookups fail", () => {
    const db = openDatabase(":memory:");
    databases.push(db);
    const user = createTestUser(db);
    const token = createSession(db, user.id, 3600);

    revokeSession(db, token);

    expect(findSessionUser(db, token)).toBeNull();
  });
});
