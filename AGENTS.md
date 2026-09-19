# Working rules

Stack: TypeScript + React. No plain JavaScript files, no other frameworks.
Never commit to `main`. Branch as `agent/<short-description>`.

## Before you say a task is done
Run `make check`. It must pass. If it fails, fix it and run again.
Do not report success on output you have not seen.

## Commands
make dev     # dev server on :5173
make check   # typecheck + lint + test — this is the gate
make build   # production build

## Conventions
- Components in src/components, one per file, named exports
- No `any`. If types fight you, say so instead of casting.
- Small commits, present tense messages

## Specs
Features start as a spec in `specs/`, written against `specs/TEMPLATE.md`.
Whoever picks up a spec implements it on a branch.
