import type { DatabaseSync } from "node:sqlite";
import type { Task, TaskInput, TaskUpdate } from "../types.js";

interface TaskRow {
  id: number;
  property_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  photo_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: Number(row.id),
    propertyId: Number(row.property_id),
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    photoUrl: row.photo_url,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const taskColumns =
  "id, property_id, title, description, status, priority, assigned_to, photo_url, completed_at, created_at, updated_at";

export interface TaskFilters {
  propertyId?: number;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function listTasks(db: DatabaseSync, filters: TaskFilters = {}): Task[] {
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
  if (filters.priority !== undefined) {
    clauses.push("priority = ?");
    values.push(filters.priority);
  }
  if (filters.dateFrom !== undefined) {
    clauses.push("created_at >= ?");
    values.push(filters.dateFrom);
  }
  if (filters.dateTo !== undefined) {
    clauses.push("created_at <= ?");
    values.push(filters.dateTo);
  }
  const where = clauses.length > 0 ? ` WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT ${taskColumns} FROM tasks${where} ORDER BY id ASC`)
    .all(...values) as unknown as TaskRow[];
  return rows.map(toTask);
}

export function getTask(db: DatabaseSync, id: number): Task | null {
  const row = db
    .prepare(`SELECT ${taskColumns} FROM tasks WHERE id = ?`)
    .get(id) as unknown as TaskRow | undefined;
  return row ? toTask(row) : null;
}

export function createTask(db: DatabaseSync, input: TaskInput): Task {
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO tasks (property_id, title, description, status, priority, assigned_to, photo_url, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.propertyId,
      input.title,
      input.description,
      input.status,
      input.priority,
      input.assignedTo,
      input.photoUrl ?? null,
      input.completedAt ?? null,
      now,
      now,
    );
  return getTask(db, Number(result.lastInsertRowid))!;
}

export function deleteTask(db: DatabaseSync, id: number): boolean {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

export function updateTask(
  db: DatabaseSync,
  id: number,
  input: TaskUpdate,
): Task | null {
  const assignments: string[] = [];
  const values: Array<string | number | null> = [];
  const fields: Array<[keyof TaskUpdate, string]> = [
    ["propertyId", "property_id"],
    ["title", "title"],
    ["description", "description"],
    ["status", "status"],
    ["priority", "priority"],
    ["assignedTo", "assigned_to"],
    ["photoUrl", "photo_url"],
    ["completedAt", "completed_at"],
  ];
  for (const [field, column] of fields) {
    if (input[field] !== undefined) {
      assignments.push(`${column} = ?`);
      values.push(input[field] as string | number | null);
    }
  }
  if (assignments.length === 0) {
    return getTask(db, id);
  }
  assignments.push("updated_at = ?");
  values.push(new Date().toISOString(), id);
  db.prepare(`UPDATE tasks SET ${assignments.join(", ")} WHERE id = ?`).run(
    ...values,
  );
  return getTask(db, id);
}
