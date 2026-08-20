import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { DatabaseSync } from "node:sqlite";
import { loadConfig } from "../config.js";
import { openDatabase } from "./index.js";

export interface SeedCounts {
  properties: number;
  tasks: number;
  expenses: number;
}

export function seedDemoData(db: DatabaseSync): SeedCounts {
  const existing = db
    .prepare("SELECT 1 AS present FROM properties LIMIT 1")
    .get() as { present: number } | undefined;
  if (existing) {
    return { properties: 0, tasks: 0, expenses: 0 };
  }

  const now = new Date().toISOString();
  const propertyInsert = db.prepare(
    "INSERT INTO properties (name, address, type, owner, monthly_rent, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const taskInsert = db.prepare(
    "INSERT INTO tasks (property_id, title, description, status, priority, assigned_to, photo_url, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const expenseInsert = db.prepare(
    "INSERT INTO expenses (property_id, description, amount, category, status, requested_by, approved_by, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  db.exec("BEGIN");
  try {
    const prop1 = Number(
      propertyInsert.run(
        "Casa Montecristo",
        "Calle 21 #304, Col. Montecristo, Mérida, Yucatán",
        "Casa",
        "Arq. Roberto Peniche",
        18_500,
        "ocupado",
        now,
        now,
      ).lastInsertRowid,
    );
    const prop2 = Number(
      propertyInsert.run(
        "Depto García Ginerés",
        "Av. Pérez Ponce #156 Int. 3B, García Ginerés, Mérida",
        "Departamento",
        "Lic. Carmen Zavala",
        12_000,
        "ocupado",
        now,
        now,
      ).lastInsertRowid,
    );
    const prop3 = Number(
      propertyInsert.run(
        "Local Itzimná",
        "Calle 17 #89, Col. Itzimná, Mérida",
        "Local Comercial",
        "Ing. Marco Cetina",
        22_000,
        "desocupado",
        now,
        now,
      ).lastInsertRowid,
    );

    taskInsert.run(
      prop1,
      "Fuga en tubería de baño principal",
      "Se detectó fuga activa en la tubería del baño principal. Requiere atención inmediata.",
      "en_proceso",
      "alta",
      "Plomero Alejandro Tun",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
      null,
      now,
      now,
    );
    taskInsert.run(
      prop1,
      "Pintura exterior deteriorada",
      "La pintura exterior de la fachada muestra deterioro significativo. Se requiere repintado completo.",
      "pendiente",
      "media",
      "Por asignar",
      null,
      null,
      now,
      now,
    );
    taskInsert.run(
      prop2,
      "AC sin enfriar en recámara",
      "El aire acondicionado de la recámara principal no enfría correctamente. Se requiere revisión y recarga.",
      "completada",
      "alta",
      "Técnico Frío Express",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      "2026-08-14T10:00:00Z",
      now,
      now,
    );
    taskInsert.run(
      prop2,
      "Revisión eléctrica general",
      "Inspección de instalaciones eléctricas, tablero, contactos y luminarias.",
      "pendiente",
      "baja",
      "Por asignar",
      null,
      null,
      now,
      now,
    );
    taskInsert.run(
      prop3,
      "Limpieza de fachada y cortinas",
      "Limpieza profunda de fachada exterior y cortinas metálicas del local.",
      "pendiente",
      "media",
      "Equipo de mantenimiento",
      null,
      null,
      now,
      now,
    );

    expenseInsert.run(
      prop1,
      "Refacciones plomería — fuga baño",
      1_850,
      "mantenimiento",
      "aprobado",
      "Plomero Alejandro Tun",
      "Coordinador Evox",
      "2026-08-13",
      now,
      now,
    );
    expenseInsert.run(
      prop1,
      "Pintura exterior (presupuesto)",
      8_400,
      "reparacion",
      "pendiente",
      "Coordinador Evox",
      null,
      "2026-08-15",
      now,
      now,
    );
    expenseInsert.run(
      prop2,
      "Recarga de gas refrigerante AC",
      950,
      "mantenimiento",
      "aprobado",
      "Técnico Frío Express",
      "Coordinador Evox",
      "2026-08-14",
      now,
      now,
    );
    expenseInsert.run(
      prop3,
      "Señalización local comercial",
      2_200,
      "servicios",
      "pendiente",
      "Coordinador Evox",
      null,
      "2026-08-16",
      now,
      now,
    );

    db.exec("COMMIT");
    return { properties: 3, tasks: 5, expenses: 4 };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export async function runSeedDemo(): Promise<SeedCounts> {
  const config = loadConfig(process.env);
  await mkdir(path.dirname(config.databasePath), { recursive: true });
  const db = openDatabase(config.databasePath);
  try {
    return seedDemoData(db);
  } finally {
    db.close();
  }
}

const entrypoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : undefined;
if (entrypoint === import.meta.url) {
  runSeedDemo()
    .then((counts) => {
      console.log(JSON.stringify(counts));
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
