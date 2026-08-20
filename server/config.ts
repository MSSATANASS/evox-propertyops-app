import type { AppConfig, NodeEnvironment } from "./types.js";

const DEFAULT_PORT = 3000;
const DEFAULT_DATABASE_PATH = "./data/propertyops.sqlite";
const DEFAULT_SESSION_TTL_SECONDS = 28_800;

function positiveInteger(
  value: string | undefined,
  fallback: number,
  variableName: string,
  maximum?: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed <= 0 ||
    (maximum && parsed > maximum)
  ) {
    throw new Error(`${variableName} must be a positive integer`);
  }

  return parsed;
}

function nodeEnvironment(value: string | undefined): NodeEnvironment {
  if (value === undefined || value.trim() === "") {
    return "development";
  }

  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  throw new Error("NODE_ENV must be development, test, or production");
}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  return {
    port: positiveInteger(env.PORT, DEFAULT_PORT, "PORT", 65_535),
    databasePath: env.DATABASE_PATH?.trim() || DEFAULT_DATABASE_PATH,
    sessionTtlSeconds: positiveInteger(
      env.SESSION_TTL_SECONDS,
      DEFAULT_SESSION_TTL_SECONDS,
      "SESSION_TTL_SECONDS",
    ),
    cookieSecure: env.COOKIE_SECURE === "true",
    nodeEnv: nodeEnvironment(env.NODE_ENV),
  };
}
