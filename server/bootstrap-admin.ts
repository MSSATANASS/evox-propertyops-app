import { pathToFileURL } from "node:url";
import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./auth/passwords.js";
import { openDatabase } from "./db/index.js";
import {
  findFirstAdmin,
  insertUser,
  type User,
} from "./db/repositories/users.js";
import { loadConfig } from "./config.js";

export async function bootstrapAdmin(
  db: DatabaseSync,
  env: NodeJS.ProcessEnv,
): Promise<User> {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error("ADMIN_EMAIL is required");
  }
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required");
  }

  if (findFirstAdmin(db)) {
    throw new Error("admin already exists");
  }

  return insertUser(db, {
    email,
    name: env.ADMIN_NAME?.trim() || "Administrador Evox",
    role: "admin",
    passwordHash: await hashPassword(password),
  });
}

export async function runBootstrapAdmin(
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const config = loadConfig(env);
  const db = openDatabase(config.databasePath);
  try {
    await bootstrapAdmin(db, env);
  } finally {
    db.close();
  }
}

const currentModule = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : null;
if (currentModule === import.meta.url) {
  runBootstrapAdmin().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "bootstrap failed"}\n`,
    );
    process.exitCode = 1;
  });
}
