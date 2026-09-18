# Self-hosting plan

## Initial topology

```text
phone/browser -> Tailscale -> Caddy HTTPS -> app/API -> Supabase/PostgreSQL
```

One always-on Linux machine runs Docker Compose. Keep PostgreSQL and admin dashboards on the private Docker network. Publish only the application entry point to the tailnet. Do not use Tailscale Funnel for the private family alpha.

## Environments

- Local: disposable developer data.
- Home alpha: one persistent host with test/family data.
- Production: use this name only after backup, restore, upgrade and rollback are proven.

Avoid permanent staging until it solves a repeated problem.

## Operational minimum before family use

- secrets outside git with a checked-in `.env.example`;
- pinned container versions and reviewed upgrades;
- nightly database backup to a second machine/location;
- an initial monthly restore drill;
- health checks and disk-space alerts;
- written deploy, rollback and lost-host steps;
- row-level authorization tests for each household-owned table.

Supabase self-hosting makes Ivan the operator responsible for maintenance, security, backups, monitoring and uptime. Those are product work, not later cleanup.
