import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./passwords";

describe("password hashing", () => {
  it("encodes a password with the documented scrypt format and verifies it", async () => {
    const encoded = await hashPassword("correct-horse-battery-staple");

    expect(encoded).toMatch(/^scrypt\$\d+\$\d+\$\d+\$[^$]+\$[^$]+$/);
    await expect(
      verifyPassword("correct-horse-battery-staple", encoded),
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", encoded)).resolves.toBe(
      false,
    );
  });

  it("rejects malformed or unsupported encoded hashes", async () => {
    await expect(verifyPassword("password", "not-a-scrypt-hash")).resolves.toBe(
      false,
    );
    await expect(
      verifyPassword("password", "scrypt$1$1$1$bad$bad"),
    ).resolves.toBe(false);
  });

  it("uses a fresh salt for each hash", async () => {
    const first = await hashPassword("same-password");
    const second = await hashPassword("same-password");

    expect(first).not.toBe(second);
    await expect(verifyPassword("same-password", first)).resolves.toBe(true);
    await expect(verifyPassword("same-password", second)).resolves.toBe(true);
  });
});
