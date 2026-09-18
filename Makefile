dev:
	pnpm dev

check:
	pnpm tsc --noEmit && pnpm lint && pnpm test --run

pw:
	pnpm exec playwright test

build:
	pnpm build
