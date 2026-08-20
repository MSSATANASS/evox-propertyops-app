import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("parses the standalone server environment", () => {
    expect(
      loadConfig({
        PORT: "4321",
        DATABASE_PATH: "/tmp/propertyops-test.sqlite",
        SESSION_TTL_SECONDS: "3600",
        COOKIE_SECURE: "true",
        NODE_ENV: "test",
      }),
    ).toEqual({
      port: 4321,
      databasePath: "/tmp/propertyops-test.sqlite",
      sessionTtlSeconds: 3600,
      cookieSecure: true,
      nodeEnv: "test",
    });
  });

  it("uses safe defaults for local development", () => {
    expect(loadConfig({})).toEqual({
      port: 3000,
      databasePath: "./data/propertyops.sqlite",
      sessionTtlSeconds: 28_800,
      cookieSecure: false,
      nodeEnv: "development",
    });
  });

  it("rejects an invalid port", () => {
    expect(() => loadConfig({ PORT: "0" })).toThrow(/PORT/);
  });

  it("rejects an invalid session TTL", () => {
    expect(() => loadConfig({ SESSION_TTL_SECONDS: "0" })).toThrow(
      /SESSION_TTL_SECONDS/,
    );
  });
});
