import type { Router } from "express";
import type { DatabaseSync } from "node:sqlite";
import { runAuditedMutation } from "../audit.js";
import { requireUser } from "../auth/middleware.js";
import {
  createProperty,
  deleteProperty,
  listProperties,
  updateProperty,
} from "../db/repositories/properties.js";
import {
  idParamSchema,
  notFound,
  parse,
  propertyCreateSchema,
  propertyUpdateSchema,
} from "../validation.js";

export interface PropertyRouteDependencies {
  db: DatabaseSync;
}

export function registerPropertyRoutes(
  router: Router,
  dependencies: PropertyRouteDependencies,
): void {
  const { db } = dependencies;
  const authenticated = requireUser(db);

  router.get("/api/properties", authenticated, (_request, response) => {
    response.status(200).json(listProperties(db));
  });

  router.post("/api/properties", authenticated, (request, response) => {
    const input = parse(propertyCreateSchema, request.body);
    const property = runAuditedMutation(
      db,
      request.user!.id,
      "create",
      "property",
      () => createProperty(db, input),
      (result) => result.id,
    );
    response.status(201).json(property);
  });

  router.patch("/api/properties/:id", authenticated, (request, response) => {
    const { id } = parse(idParamSchema, request.params);
    const input = parse(propertyUpdateSchema, request.body);
    const property = runAuditedMutation(
      db,
      request.user!.id,
      "update",
      "property",
      () => {
        const result = updateProperty(db, id, input);
        if (!result) {
          throw notFound("property");
        }
        return result;
      },
      (result) => result.id,
    );
    response.status(200).json(property);
  });

  router.delete("/api/properties/:id", authenticated, (request, response) => {
    const { id } = parse(idParamSchema, request.params);
    runAuditedMutation(
      db,
      request.user!.id,
      "delete",
      "property",
      () => {
        if (!deleteProperty(db, id)) {
          throw notFound("property");
        }
        return id;
      },
      (result) => result,
    );
    response.status(204).send();
  });
}
