import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const artifactDir = path.resolve("dist");

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

const artifactAvailable = existsSync(artifactDir);

describe("frontend build artifact", () => {
  it.skipIf(!artifactAvailable)(
    "contains no Hercules or Convex runtime markers",
    async () => {
      const files = await collectFiles(artifactDir);
      expect(files.length).toBeGreaterThan(0);

      const forbidden =
        /Hercules|hercules|usehercules|Convex|convex\/|HERCULES_|VITE_CONVEX_URL|oidc|OIDC/;
      for (const file of files) {
        const content = await readFile(file, "utf8");
        expect(content, path.relative(process.cwd(), file)).not.toMatch(
          forbidden,
        );
      }
    },
  );

  it.skipIf(!artifactAvailable)(
    "contains the built SPA entrypoint",
    async () => {
      const indexPath = path.join(artifactDir, "index.html");
      const indexStats = await stat(indexPath);
      expect(indexStats.isFile()).toBe(true);
      expect(await readFile(indexPath, "utf8")).toContain(
        "PropertyOps by Evox",
      );
    },
  );
});
