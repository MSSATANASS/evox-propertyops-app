# Evox PropertyOps — Hercules copy

This repository is a source copy of **PropertyOps by Evox**, exported from the Hercules development environment on August 19, 2026. It contains the dashboard for property operations in Mérida, including properties, tasks, expenses, reports, and the read-only owner portal.

## Stack

The application uses React, TypeScript, Vite, Tailwind CSS, Motion, Convex, React Router, and the Hercules authentication package. The Convex functions and generated API declarations are included under `convex/`.

## Local setup

1. Copy `.env.example` to `.env` and fill in the required Convex and OIDC values.
2. Install dependencies with `pnpm install`.
3. Start the development server with `pnpm dev`.
4. Open the local URL shown by Vite.

The production bundle can be verified with `pnpm build`. The copy was validated locally with TypeScript compilation and a successful Vite production build.

## Important notes

This repository intentionally excludes `.env` files, `node_modules`, generated build output, and other local artifacts. No credentials or private browser data were included in the copy. Configure the Convex deployment and OIDC provider before using the application outside the Hercules preview environment.

## Source provenance

The source was recovered from the Hercules Codebase view and the active Hercules development machine for the application identified as `Mérida Property Demo`, version `v8`. Hercules-specific development-editor scripts were removed from the standalone `index.html` so the project can build independently with Vite.
