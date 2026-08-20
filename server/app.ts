import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { DatabaseSync } from "node:sqlite";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerExpenseRoutes } from "./routes/expenses.js";
import { registerOwnerRoutes } from "./routes/owner.js";
import { registerPropertyRoutes } from "./routes/properties.js";
import { registerReportRoutes } from "./routes/reports.js";
import { registerTaskRoutes } from "./routes/tasks.js";
import { SCHEMA_VERSION } from "./db/schema.js";
import { HttpError } from "./validation.js";
import type { AppConfig } from "./types.js";

export interface CreateAppOptions {
  db: DatabaseSync;
  config: AppConfig;
  version?: string;
  staticDir?: string;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const router = express.Router();
  const version = options.version ?? "0.1.0";

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  router.get("/api/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      version,
      schemaVersion: SCHEMA_VERSION,
    });
  });

  registerAuthRoutes(router, options);
  registerPropertyRoutes(router, options);
  registerTaskRoutes(router, options);
  registerExpenseRoutes(router, options);
  registerReportRoutes(router, options);
  registerOwnerRoutes(router, options);
  app.use(router);

  if (options.staticDir) {
    app.use(express.static(options.staticDir));
  }

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }

      if (error instanceof HttpError) {
        response.status(error.status).json({
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        });
        return;
      }

      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: number }).status === 413
      ) {
        response.status(413).json({
          code: "PAYLOAD_TOO_LARGE",
          message: "request body is too large",
        });
        return;
      }

      response.status(500).json({
        code: "INTERNAL_ERROR",
        message: "internal server error",
      });
    },
  );

  return app;
}
