# Mega-dev

Agent-readable repository map. Read `CONTEXT.md`, then only the files it routes to.

```text
Mega-dev/
├── CLAUDE.md       # repository map
├── CONTEXT.md      # task router
├── PRODUCT-BRIEF.md # product vision, principles and locked decisions
├── STACK.md        # proposed architecture and decision gates
├── ROADMAP.md      # milestones and exit criteria
├── PLANNING.md     # GitHub workflow and ADR method
├── SELF-HOSTING.md # home-machine hosting plan
├── TAILSCALE.md    # private access and self-hosting plan
├── TARZAN-BACKLOG.md # runner-game research and revival candidates
├── AGENTS.md       # coding and quality conventions
├── Makefile        # local quality gate
├── specs/          # feature specs (see specs/TEMPLATE.md)
├── e2e/            # Playwright child-journey tests
└── src/            # the app: hubs in src/features, shared shell in src/components
```

## Conventions

- One decision has one canonical home. Other files link to it.
- Router files point to content but do not duplicate it.
- Keep raw ideas separate from accepted requirements.
- Record expensive technical choices as short ADRs when implementation begins.
- Do not put credentials, private addresses, tailnet names or family data in this public repository.

The app has shipped well past the Vite scaffold (see CONTEXT.md's current state). The proposed stack is a reversible starting point, not a final architecture.
