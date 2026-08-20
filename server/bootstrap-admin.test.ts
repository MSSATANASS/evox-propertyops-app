import { afterEach, describe, expect, it } from "vitest";
import { verifyPassword } from "./auth/passwords";
import { openDatabase } from "./db/index";
import { findUserByEmail } from "./db/repositories/users";
import { bootstrapAdmin } from "./bootstrap-admin";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

describe("bootstrap admin", () => {
  it("creates the first admin from environment values and hashes its password", async () => {
    const db = openDatabase(":memory:");
    databases.push(db);

    const admin = await bootstrapAdmin(db, {
      ADMIN_EMAIL: "ADMIN@example.com",
      ADMIN_PASSWORD: "initial-password",
    });

    expect(admin).toMatchObject({
      email: "admin@example.com",
      role: "admin",
      name: "Administrador Evox",
    });
    expect(admin.passwordHash).not.toContain("initial-password");
    await expect(verifyPassword("initial-password", admin.passwordHash)).resolves.toBe(
      true,
    );
  });

  it("fails without an admin password", async () => {
    const db = openDatabase(":memory:");
    databases.push(db);

    await expect(
      bootstrapAdmin(db, { ADMIN_EMAIL: "admin@example.com" }),
    ).rejects.toThrow("ADMIN_PASSWORD is required");
  });

  it("does not create a second admin", async () => {
    const db = openDatabase(":memory:");
    databases.push(db);
    await bootstrapAdmin(db, {
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "initial-password",
    });

    await expect(
      bootstrapAdmin(db, {
        ADMIN_EMAIL: "other@example.com",
        ADMIN_PASSWORD: "other-password",
      }),
    ).rejects.toThrow("admin already exists");
    expect(findUserByEmail(db, "other@example.com")).toBeNull();
  });
});

