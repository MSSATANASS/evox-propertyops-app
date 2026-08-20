// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalAuthProvider, useLocalAuth } from "./local-auth";

const user = {
  id: 1,
  email: "admin@example.com",
  name: "Admin Local",
  role: "admin",
  ownerSlug: null,
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

function Consumer() {
  const auth = useLocalAuth();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="email">{auth.user?.email ?? "none"}</span>
      <button
        type="button"
        onClick={() => void auth.login("admin@example.com", "password")}
      >
        login
      </button>
    </div>
  );
}

describe("LocalAuthProvider", () => {
  it("loads /api/auth/me on mount and updates the user after login", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "UNAUTHENTICATED" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ user }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <LocalAuthProvider>
        <Consumer />
      </LocalAuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated"),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated"),
    );
    expect(screen.getByTestId("email").textContent).toBe("admin@example.com");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password",
        }),
      }),
    );
  });
});
