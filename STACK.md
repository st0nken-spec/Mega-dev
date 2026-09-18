# Proposed stack

**Status:** proposed; PWA-first versus native is an open ADR

## Recommendation for this product

Start with a **responsive, installable PWA** using the existing React + TypeScript + Vite scaffold. Add:

- React Router for hub/game routes;
- a web app manifest and service worker for installation and cached app assets;
- SVG for scalable game/coloring assets;
- Canvas + Pointer Events for drawing, touch and stylus input;
- Web Audio / speech only after testing on the actual family devices;
- self-hosted Supabase/PostgreSQL for parent accounts, child profiles, content and progress;
- Zod at boundaries and generated Supabase database types;
- Vitest and Playwright for critical touch/web flows;
- Docker Compose + Caddy on the always-on home machine;
- private family access with Tailscale and no public endpoint.

## Why PWA-first

The first hubs are 2D games, touch drawing, coloring and forms. Standard browser APIs cover these well, and one web build runs on phones, tablets and computers without app-store accounts or review. A PWA can be installed to a phone home screen; iOS requires a manual Add to Home Screen step. Tailscale already provides the private distribution boundary.

This gets the first child-tested game into use fastest and keeps the existing smoke-test scaffold useful.

## Open ADR: stay PWA or add native

Do not close the native option. Re-evaluate after the first vertical slice on real devices.

Choose **Expo/React Native** later if testing shows a material need for stronger offline/background behavior, richer local notifications, app-store delivery, deep native APIs, or browser performance that cannot meet the drawing/game target. If native is added, keep domain logic and content schemas in shared TypeScript packages rather than forcing all UI to be shared.

## Backend and repository shape

Use a modular monolith and pnpm workspaces only when the second package appears:

```text
apps/web/          # installable PWA
packages/domain/   # game rules, learning content types and progress logic
packages/content/  # curated question/activity packs
supabase/          # migrations, row-level policies and seed data
infra/             # Compose and Caddy configuration
```

Add Turborepo only when multiple apps/packages make task caching useful. Avoid microservices, Kubernetes, GraphQL, a message bus and a second database until evidence requires them.

## Child-data boundary

Separate parent identity, household membership, child profiles, activity content, attempts and artwork. Test row-level policies for every household-owned table. Keep generated homework parent-reviewed. Do not send child data to external AI services without a later explicit privacy decision.
