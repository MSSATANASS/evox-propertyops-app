import type { DatabaseSync } from "node:sqlite";

export type AuditOperation = "create" | "update";

export function recordAuditEvent(
  db: DatabaseSync,
  userId: number,
  operation: AuditOperation,
  entity: string,
  entityId: number,
): void {
  db.prepare(
    "INSERT INTO audit_events (user_id, operation, entity, entity_id, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(userId, operation, entity, entityId, new Date().toISOString());
}

export function runAuditedMutation<T>(
  db: DatabaseSync,
  userId: number,
  operation: AuditOperation,
  entity: string,
  mutation: () => T,
  entityId: (result: T) => number,
): T {
  db.exec("BEGIN");
  try {
    const result = mutation();
    recordAuditEvent(db, userId, operation, entity, entityId(result));
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
