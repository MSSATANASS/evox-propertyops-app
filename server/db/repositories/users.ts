import type { DatabaseSync } from "node:sqlite";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  ownerSlug: string | null;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  email: string;
  name?: string | null;
  role: string;
  ownerSlug?: string | null;
  passwordHash: string;
}

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
  owner_slug: string | null;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    role: row.role,
    ownerSlug: row.owner_slug,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const userColumns =
  "id, email, name, role, owner_slug, password_hash, created_at, updated_at";

export function findUserByEmail(db: DatabaseSync, email: string): User | null {
  const row = db
    .prepare(`SELECT ${userColumns} FROM users WHERE email = ?`)
    .get(email.toLowerCase()) as unknown as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function findUserById(db: DatabaseSync, id: number): User | null {
  const row = db
    .prepare(`SELECT ${userColumns} FROM users WHERE id = ?`)
    .get(id) as unknown as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function findFirstAdmin(db: DatabaseSync): User | null {
  const row = db
    .prepare(
      `SELECT ${userColumns} FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`,
    )
    .get() as unknown as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function insertUser(db: DatabaseSync, input: UserInput): User {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO users (email, name, role, owner_slug, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.email.toLowerCase(),
      input.name ?? null,
      input.role,
      input.ownerSlug ?? null,
      input.passwordHash,
      now,
      now,
    );
  return findUserById(db, Number(result.lastInsertRowid))!;
}
