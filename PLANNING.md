# Planning framework

Use the repository for durable context and GitHub for the live work queue.

## Sources of truth

- Product vision, users and non-goals: product brief after discovery.
- Sequencing and exit criteria: `ROADMAP.md`.
- Time-boxed outcomes: GitHub milestones.
- Executable work: GitHub issues.
- Current flow: one GitHub Project.
- Technical decisions: short architecture decision records (ADRs).
- Change history: Git.

Do not duplicate every issue in Markdown. The roadmap explains why and order; issues describe the next testable unit.

## One lightweight GitHub Project

Create one user-level Project named `Mega-dev` with:

- Status: Inbox, Ready, In progress, Review, Done
- Priority: P0, P1, P2
- Type: Feature, Bug, Chore, Research
- Size: XS, S, M, L
- Target date only for real deadlines

Views: Now board, Backlog table and Roadmap grouped by milestone. Automate adding new repo issues and moving closed items to Done. Avoid sprints until a fixed cadence proves useful.

## Issue and PR rules

- One issue produces one observable outcome.
- Include context, acceptance criteria, non-goals and test notes.
- Use a research spike when uncertainty blocks a small implementation issue.
- Split anything larger than L before starting.
- Link PRs to issues; keep one human-reviewable concern per PR.
- Agents prepare branches and PRs; Ivan reviews before merge.

## Weekly loop

1. Shape one captured idea into a problem statement.
2. Keep at most one M/L and one XS/S item in progress.
3. Build the smallest vertical slice and run the repository check.
4. Inspect the PR diff and test the visible result.
5. Update an ADR or roadmap only when evidence changes a decision.

A milestone is an outcome with exit criteria, not a date bucket. A release is a deployable version; one milestone may create several releases.
