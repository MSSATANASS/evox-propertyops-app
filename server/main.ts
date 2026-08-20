import { mkdirSync } from "node:fs";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { openDatabase } from "./db/index.js";
import type { AppConfig } from "./types.js";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

export interface ServerRuntimeOptions {
  config: AppConfig;
  distDir?: string;
  version?: string;
}

export interface ServerRuntime {
  app: ReturnType<typeof createApp>;
  db: ReturnType<typeof openDatabase>;
}

export function createServerRuntime(
  options: ServerRuntimeOptions,
): ServerRuntime {
  if (options.config.databasePath !== ":memory:") {
    mkdirSync(path.dirname(options.config.databasePath), { recursive: true });
  }
  const db = openDatabase(options.config.databasePath);
  const app = createApp({
    db,
    config: options.config,
    version: options.version ?? "0.1.0",
    staticDir: options.distDir,
  });
  return { app, db };
}

export function startServer(
  options: ServerRuntimeOptions = {
    config: loadConfig(process.env),
  },
): Server {
  const distDir =
    options.distDir ?? path.resolve(moduleDirectory, "../../dist");
  const runtime = createServerRuntime({ ...options, distDir });
  const server = createServer(runtime.app);
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[PropertyOps] received ${signal}; shutting down`);
    server.close(() => {
      runtime.db.close();
      console.log("[PropertyOps] shutdown complete");
    });
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));

  server.listen(options.config.port, () => {
    const address = server.address();
    const port =
      typeof address === "object" && address
        ? address.port
        : options.config.port;
    console.log(`[PropertyOps] listening on port ${port}`);
  });

  return server;
}

const entrypoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : undefined;
if (entrypoint === import.meta.url) {
  startServer();
}
