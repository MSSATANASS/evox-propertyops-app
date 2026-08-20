import type { Express, NextFunction, Request, Response } from "express";
import express from "express";

export function mountStatic(app: Express, distDir: string): void {
  app.use(express.static(distDir));
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.path === "/api" || request.path.startsWith("/api/")) {
      next();
      return;
    }

    response.sendFile("index.html", { root: distDir }, (error) => {
      if (error) {
        next(error);
      }
    });
  });
}
