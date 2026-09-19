# Mega-dev

Private, Swedish-first family learning hub for young children. The app includes separate child profiles, Play, Create and Homework hubs, and works as an installable PWA.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Quality gate

```sh
make check
make build
pnpm exec playwright test
```

`make check` runs TypeScript, lint and unit tests. Playwright covers the child journeys at a phone viewport. The production build registers the service worker; development does not.

## Data and privacy

Profile progress stays in this browser's local storage. There is no account, analytics, advertising, or server-side child data in the current app. Use the reset control next to a profile to clear its stars.
