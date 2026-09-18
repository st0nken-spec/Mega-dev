dev:
	pnpm dev

check:
	pnpm tsc --noEmit && pnpm lint && pnpm test --run

build:
	pnpm build
