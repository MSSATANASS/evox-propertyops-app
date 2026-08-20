import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(".");
const runtimeRoots = ["src", "server"];
const runtimeFiles = [
  "vite.config.ts",
  "package.json",
  "index.html",
  "tsconfig.json",
  "tsconfig.app.json",
];
const extensions = new Set([".ts", ".tsx", ".js", ".json", ".html"]);
const forbidden =
  /Hercules|hercules|usehercules|Convex|convex\/|HERCULES_|VITE_CONVEX_URL|oidc|OIDC/;

async function collectRuntimeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRuntimeFiles(entryPath)));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files;
}

describe("runtime decoupling", () => {
  it("contains no Hercules, Convex, or OIDC runtime references", async () => {
    const files = [
      ...runtimeFiles.map((file) => path.join(root, file)),
      ...(
        await Promise.all(
          runtimeRoots.map((directory) =>
            collectRuntimeFiles(path.join(root, directory)),
          ),
        )
      ).flat(),
    ];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      expect(content, path.relative(root, file)).not.toMatch(forbidden);
    }
  });
});
