# Mega-dev

Agent-readable repository map. Read `CONTEXT.md`, then only the files it routes to.

```text
Mega-dev/
├── CLAUDE.md       # repository map
├── CONTEXT.md      # task router
├── STACK.md        # proposed architecture and decision gates
├── ROADMAP.md      # milestones and exit criteria
├── PLANNING.md     # GitHub workflow and ADR method
├── TAILSCALE.md    # private access and self-hosting plan
├── AGENTS.md       # coding and quality conventions
├── Makefile        # local quality gate
└── src/            # current Vite proof-of-life app
```

## Conventions

- One decision has one canonical home. Other files link to it.
- Router files point to content but do not duplicate it.
- Keep raw ideas separate from accepted requirements.
- Record expensive technical choices as short ADRs when implementation begins.
- Do not put credentials, private addresses, tailnet names or family data in this public repository.

The current Vite scaffold stays intact until the product's first job is defined. The proposed stack is a reversible starting point, not a final architecture.
