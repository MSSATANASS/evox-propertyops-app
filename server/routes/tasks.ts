import type { Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import { runAuditedMutation } from "../audit.js";
import { requireUser } from "../auth/middleware.js";
import {
  createTask,
  getTask,
  listTasks,
  updateTask,
} from "../db/repositories/tasks.js";
import { getProperty } from "../db/repositories/properties.js";
import {
  idParamSchema,
  notFound,
  parse,
  taskCreateSchema,
  taskQuerySchema,
  taskUpdateSchema,
} from "../validation.js";

export interface TaskRouteDependencies {
  db: DatabaseSync;
}

export function registerTaskRoutes(
  router: Router,
  dependencies: TaskRouteDependencies,
): void {
  const { db } = dependencies;
  const authenticated = requireUser(db);

  router.get("/api/tasks", authenticated, (request, response) => {
    const filters = parse(taskQuerySchema, request.query);
    response.status(200).json(listTasks(db, filters));
  });

  router.post("/api/tasks", authenticated, (request, response) => {
    const input = parse(taskCreateSchema, request.body);
    if (!getProperty(db, input.propertyId)) {
      throw notFound("property");
    }
    const task = runAuditedMutation(
      db,
      request.user!.id,
      "create",
      "task",
      () => createTask(db, input),
      (result) => result.id,
    );
    response.status(201).json(task);
  });

  router.patch("/api/tasks/:id", authenticated, (request, response) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(taskUpdateSchema, request.body);
    if (input.propertyId !== undefined && !getProperty(db, input.propertyId)) {
      throw notFound("property");
    }
    if (!getTask(db, id)) {
      throw notFound("task");
    }
    const task = runAuditedMutation(
      db,
      request.user!.id,
      "update",
      "task",
      () => {
        const result = updateTask(db, id, input);
        if (!result) {
          throw notFound("task");
        }
        return result;
      },
      (result) => result.id,
    );
    response.status(200).json(task);
  });
}
