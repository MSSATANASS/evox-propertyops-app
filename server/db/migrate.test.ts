import { afterEach, describe, expect, it } from "vitest";
import { openDatabase } from "./index";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

describe("openDatabase", () => {
  it("creates the version-one schema and enables foreign keys", () => {
    const db = openDatabase(":memory:");
    databases.push(db);

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all() as Array<{ name: string }>;

    expect(tables.map(({ name }) => name)).toEqual([
      "audit_events",
      "expenses",
      "properties",
      "schema_migrations",
      "sessions",
      "tasks",
      "users",
    ]);
    expect(
      (db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number })
        .foreign_keys,
    ).toBe(1);
    expect(
      (db.prepare("PRAGMA user_version").get() as { user_version: number })
        .user_version,
    ).toBe(1);
  });

  it("is idempotent when opening the same database twice", () => {
    const first = openDatabase(":memory:");
    databases.push(first);
    first.prepare("INSERT INTO properties (name, address, type, owner, monthly_rent, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      "Casa de prueba",
      "Calle 1",
      "Casa",
      "Gael",
      1000,
      "ocupado",
      "2026-08-20T00:00:00.000Z",
      "2026-08-20T00:00:00.000Z",
    );

    expect(() => {
      first.prepare("SELECT COUNT(*) AS count FROM properties").get();
    }).not.toThrow();
  });
});
