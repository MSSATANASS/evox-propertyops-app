export type NodeEnvironment = "development" | "test" | "production";

export interface AppConfig {
  port: number;
  databasePath: string;
  sessionTtlSeconds: number;
  cookieSecure: boolean;
  nodeEnv: NodeEnvironment;
}
