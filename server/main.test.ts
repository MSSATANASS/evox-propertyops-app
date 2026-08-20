import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServerRuntime } from "./main.js";
import type { AppConfig } from "./types.js";

const config: AppConfig = {
  port: 0,
  databasePath: ":memory:",
  sessionTtlSeconds: 3600,
  cookieSecure: false,
  nodeEnv: "test",
};

describe("standalone server entrypoint", () => {
  let distDir: string;
  let runtime: Awaited<ReturnType<typeof createServerRuntime>>;

  beforeAll(async () => {
    distDir = await mkdtemp(path.join(os.tmpdir(), "propertyops-dist-"));
    await writeFile(
      path.join(distDir, "index.html"),
      '<!doctype html><html><body><div id="root">PropertyOps shell</div></body></html>',
      "utf8",
    );
    runtime = createServerRuntime({ config, distDir });
  });

  afterAll(async () => {
    runtime.db.close();
    await rm(distDir, { recursive: true, force: true });
  });

  it("answers health without authentication", async () => {
    await request(runtime.app)
      .get("/api/health")
      .expect(200)
      .expect({ status: "ok", version: "0.1.0", schemaVersion: 1 });
  });

  it("serves the SPA shell for root and direct browser routes", async () => {
    await request(runtime.app)
      .get("/")
      .expect(200)
      .expect(/PropertyOps shell/);
    await request(runtime.app)
      .get("/properties")
      .expect(200)
      .expect(/PropertyOps shell/);
    await request(runtime.app)
      .get("/owner/Arq.%20Roberto%20Peniche")
      .expect(200)
      .expect(/PropertyOps shell/);
  });

  it("returns a JSON 404 envelope for unknown API routes", async () => {
    await request(runtime.app)
      .get("/api/does-not-exist")
      .expect("Content-Type", /json/)
      .expect(404)
      .expect({ code: "NOT_FOUND", message: "route not found" });
  });
});
