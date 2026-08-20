import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "./migrate.js";

export function openDatabase(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL;");
  runMigrations(db);
  return db;
}

