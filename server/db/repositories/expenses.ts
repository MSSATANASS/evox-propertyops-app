import type { DatabaseSync } from "node:sqlite";
import type { Expense, ExpenseInput, ExpenseUpdate } from "../types.js";

interface ExpenseRow {
  id: number;
  property_id: number;
  description: string;
  amount: number;
  category: string;
  status: string;
  requested_by: string;
  approved_by: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: Number(row.id),
    propertyId: Number(row.property_id),
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    status: row.status,
    requestedBy: row.requested_by,
    approvedBy: row.approved_by,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const expenseColumns =
  "id, property_id, description, amount, category, status, requested_by, approved_by, date, created_at, updated_at";

export interface ExpenseFilters {
  propertyId?: number;
  status?: string;
  category?: string;
}

export function listExpenses(
  db: DatabaseSync,
  filters: ExpenseFilters = {},
): Expense[] {
  const clauses: string[] = [];
  const values: Array<string | number> = [];
  if (filters.propertyId !== undefined) {
    clauses.push("property_id = ?");
    values.push(filters.propertyId);
  }
  if (filters.status !== undefined) {
    clauses.push("status = ?");
    values.push(filters.status);
  }
  if (filters.category !== undefined) {
    clauses.push("category = ?");
    values.push(filters.category);
  }
  const where = clauses.length > 0 ? ` WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT ${expenseColumns} FROM expenses${where} ORDER BY id ASC`)
    .all(...values) as unknown as ExpenseRow[];
  return rows.map(toExpense);
}

export function getExpense(db: DatabaseSync, id: number): Expense | null {
  const row = db
    .prepare(`SELECT ${expenseColumns} FROM expenses WHERE id = ?`)
    .get(id) as unknown as ExpenseRow | undefined;
  return row ? toExpense(row) : null;
}

export function createExpense(db: DatabaseSync, input: ExpenseInput): Expense {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO expenses (property_id, description, amount, category, status, requested_by, approved_by, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.propertyId,
      input.description,
      input.amount,
      input.category,
      input.status,
      input.requestedBy,
      input.approvedBy ?? null,
      input.date,
      now,
      now,
    );
  return getExpense(db, Number(result.lastInsertRowid))!;
}

export function updateExpense(
  db: DatabaseSync,
  id: number,
  input: ExpenseUpdate,
): Expense | null {
  const assignments: string[] = [];
  const values: Array<string | number | null> = [];
  const fields: Array<[keyof ExpenseUpdate, string]> = [
    ["propertyId", "property_id"],
    ["description", "description"],
    ["amount", "amount"],
    ["category", "category"],
    ["status", "status"],
    ["requestedBy", "requested_by"],
    ["approvedBy", "approved_by"],
    ["date", "date"],
  ];
  for (const [field, column] of fields) {
    if (input[field] !== undefined) {
      assignments.push(`${column} = ?`);
      values.push(input[field] as string | number | null);
    }
  }
  if (assignments.length === 0) {
    return getExpense(db, id);
  }
  assignments.push("updated_at = ?");
  values.push(new Date().toISOString(), id);
  db.prepare(`UPDATE expenses SET ${assignments.join(", ")} WHERE id = ?`).run(
    ...values,
  );
  return getExpense(db, id);
}
