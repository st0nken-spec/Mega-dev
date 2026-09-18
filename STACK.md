# Proposed stack

**Status:** proposed pending product definition

## Recommendation

- **Client:** Expo + React Native + Expo Router for iOS, Android and web.
- **Backend:** self-hosted Supabase for PostgreSQL, authentication, storage and realtime needs.
- **Workspace:** pnpm workspaces. Add Turborepo only when a second app/package makes task caching useful.
- **Validation/data access:** Zod at boundaries and generated Supabase database types. Start with Supabase's client and SQL migrations rather than adding an ORM.
- **Testing:** Vitest for units, React Native Testing Library for UI, and Playwright for a few critical web flows.
- **Hosting:** Docker Compose on one Linux host; Caddy for local TLS/reverse proxy; Tailscale for private access.
- **Automation:** GitHub Actions runs the same `make check` gate as local development. Keep deployment manual until the first environment is stable.

## Why this default

Expo Router uses one routing model across native and web while retaining access to native phone capabilities. Expo officially supports pnpm monorepos. PostgreSQL keeps the data portable; Supabase packages common backend needs without separate services on day one. Tailscale avoids exposing the private backend to the public internet.

Use a modular monolith. Do not add microservices, Kubernetes, GraphQL, a message bus or a second database until measured needs justify them.

## Intended shape after product discovery

```text
apps/app/         # Expo Router: iOS, Android and web
packages/domain/  # platform-neutral business rules and types
packages/ui/      # shared UI where sharing is honest
supabase/         # migrations and seed data
infra/            # Compose and Caddy configuration
```

The Vite scaffold remains untouched until the product idea is known. Replace it with `apps/app`, or keep a separate web app only if public SEO or different desktop UX requires it.

## Decision gates

Revisit this choice for public search-indexed content, heavy background jobs, offline-first collaboration, unusual native APIs, public access without Tailscale, or app-store distribution.

## Assumptions to validate

1. The first product is a private family app, not a marketplace or public content site.
2. One household-sized server and PostgreSQL are sufficient initially.
3. Family members can install Tailscale and the app, or use its web build.
4. Native phone capabilities will matter eventually, not only a home-screen PWA.
