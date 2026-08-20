import type { DatabaseSync } from "node:sqlite";
import type { Property, PropertyInput, PropertyUpdate } from "../types.js";

interface PropertyRow {
  id: number;
  name: string;
  address: string;
  type: string;
  owner: string;
  monthly_rent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function toProperty(row: PropertyRow): Property {
  return {
    id: Number(row.id),
    name: row.name,
    address: row.address,
    type: row.type,
    owner: row.owner,
    monthlyRent: Number(row.monthly_rent),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const propertyColumns =
  "id, name, address, type, owner, monthly_rent, status, created_at, updated_at";

export function listProperties(db: DatabaseSync): Property[] {
  const rows = db
    .prepare(`SELECT ${propertyColumns} FROM properties ORDER BY id ASC`)
    .all() as unknown as PropertyRow[];
  return rows.map(toProperty);
}

export function getProperty(db: DatabaseSync, id: number): Property | null {
  const row = db
    .prepare(`SELECT ${propertyColumns} FROM properties WHERE id = ?`)
    .get(id) as unknown as PropertyRow | undefined;
  return row ? toProperty(row) : null;
}

export function createProperty(
  db: DatabaseSync,
  input: PropertyInput,
): Property {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO properties (name, address, type, owner, monthly_rent, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.name,
      input.address,
      input.type,
      input.owner,
      input.monthlyRent,
      input.status,
      now,
      now,
    );
  return getProperty(db, Number(result.lastInsertRowid))!;
}

export function deleteProperty(db: DatabaseSync, id: number): boolean {
  const result = db.prepare("DELETE FROM properties WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

export function updateProperty(
  db: DatabaseSync,
  id: number,
  input: PropertyUpdate,
): Property | null {
  const assignments: string[] = [];
  const values: Array<string | number | null> = [];
  const fields: Array<[keyof PropertyUpdate, string]> = [
    ["name", "name"],
    ["address", "address"],
    ["type", "type"],
    ["owner", "owner"],
    ["monthlyRent", "monthly_rent"],
    ["status", "status"],
  ];

  for (const [field, column] of fields) {
    if (input[field] !== undefined) {
      assignments.push(`${column} = ?`);
      values.push(input[field] as string | number);
    }
  }

  if (assignments.length === 0) {
    return getProperty(db, id);
  }

  assignments.push("updated_at = ?");
  values.push(new Date().toISOString(), id);
  db.prepare(
    `UPDATE properties SET ${assignments.join(", ")} WHERE id = ?`,
  ).run(...values);
  return getProperty(db, id);
}
