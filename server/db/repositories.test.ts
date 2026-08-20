import { afterEach, describe, expect, it } from "vitest";
import { openDatabase } from "./index";
import {
  createProperty,
  listProperties,
  updateProperty,
} from "./repositories/properties";
import { createTask, listTasks, updateTask } from "./repositories/tasks";
import { createExpense, listExpenses, updateExpense } from "./repositories/expenses";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

describe("domain repositories", () => {
  it("round-trips a property and updates its status", () => {
    const db = openDatabase(":memory:");
    databases.push(db);

    const property = createProperty(db, {
      name: "Casa Montecristo",
      address: "Calle 21 #304",
      type: "Casa",
      owner: "Arq. Roberto Peniche",
      monthlyRent: 18_500,
      status: "ocupado",
    });

    expect(listProperties(db)).toEqual([property]);
    expect(updateProperty(db, property.id, { status: "desocupado" })).toMatchObject({
      id: property.id,
      status: "desocupado",
    });
  });

  it("round-trips tasks and expenses linked to a property", () => {
    const db = openDatabase(":memory:");
    databases.push(db);
    const property = createProperty(db, {
      name: "Depto García Ginerés",
      address: "Av. Pérez Ponce #156",
      type: "Departamento",
      owner: "Lic. Carmen Zavala",
      monthlyRent: 12_000,
      status: "ocupado",
    });

    const task = createTask(db, {
      propertyId: property.id,
      title: "Revisar aire acondicionado",
      description: "Revisión y recarga",
      status: "pendiente",
      priority: "alta",
      assignedTo: "Técnico Frío Express",
    });
    const expense = createExpense(db, {
      propertyId: property.id,
      description: "Recarga de gas",
      amount: 950,
      category: "mantenimiento",
      status: "pendiente",
      requestedBy: "Técnico Frío Express",
      date: "2026-08-14",
    });

    expect(listTasks(db, { propertyId: property.id })).toEqual([task]);
    expect(listExpenses(db, { propertyId: property.id })).toEqual([expense]);
    expect(updateTask(db, task.id, { status: "completada", completedAt: "2026-08-20T00:00:00Z" })).toMatchObject({
      id: task.id,
      status: "completada",
    });
    expect(updateExpense(db, expense.id, { status: "aprobado", approvedBy: "Coordinador Evox" })).toMatchObject({
      id: expense.id,
      status: "aprobado",
    });
  });
});
