import { afterEach, describe, expect, it } from "vitest";
import { openDatabase } from "./index";
import { seedDemoData } from "./seed";

const databases: ReturnType<typeof openDatabase>[] = [];

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

describe("seedDemoData", () => {
  it("creates the demo properties, tasks, and expenses once", () => {
    const db = openDatabase(":memory:");
    databases.push(db);

    expect(seedDemoData(db)).toEqual({
      properties: 3,
      tasks: 5,
      expenses: 4,
    });
    expect(seedDemoData(db)).toEqual({
      properties: 0,
      tasks: 0,
      expenses: 0,
    });
    expect(
      (db.prepare("SELECT COUNT(*) AS count FROM properties").get() as { count: number })
        .count,
    ).toBe(3);
  });
});
