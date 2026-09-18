# Private preview deployment

This serves the current PWA as one read-only container on loopback. Tailscale or an existing host reverse proxy provides the private network edge. It does not expose a public port and does not install or configure Tailscale automatically.

## Host prerequisites

Verify before first deploy:

- reachable host name/Tailscale DNS name and SSH user;
- Docker Engine with Compose v2;
- repository checkout path and deploy branch/commit;
- free loopback port (default `8080`);
- Tailscale connected, or an existing private reverse proxy;
- rollback owner and retention policy.

## Build and test on the host

```sh
git fetch origin
git checkout <reviewed-commit>
make check
docker compose build --pull
docker compose up -d
docker compose ps
curl --fail http://127.0.0.1:8080/healthz
```

Record the exact commit before calling the deployment complete:

```sh
git rev-parse HEAD
docker compose images
```

## Tailscale access

Preferred initial route on the host:

```sh
tailscale serve --bg http://127.0.0.1:8080
```

Use the exact HTTPS URL printed by Tailscale. Do not use Funnel. If Caddy already owns the tailnet HTTPS endpoint, proxy it to `127.0.0.1:8080` instead of running a second edge.

## Update

Repeat fetch, checkout of the reviewed commit, checks, build, `up -d`, health check and commit readback. Do not auto-deploy on merge until the real host process is understood.

## Rollback

```sh
git checkout <previous-known-good-commit>
docker compose build
docker compose up -d
curl --fail http://127.0.0.1:8080/healthz
```

## Not included yet

M1 stores profiles and stars in browser local storage. PostgreSQL, backups, parent authentication and the local model adapter belong to later milestones.
