# Product brief

**Status:** M0 draft for Ivan's review

## Vision

Mega-dev is a private, self-hosted family learning hub for young children, roughly ages 4-6. It should feel like play first while quietly practicing useful skills. Parents control content and difficulty; children get a simple, safe interface without ads or public accounts.

## Planned hubs

### Play hub

Start with a few small games:

- Snake with age-appropriate number, letter, word or knowledge goals
- Tic-tac-toe / three-in-a-row with short learning prompts between turns
- Matching pairs for letters, words, quantities, shapes and facts
- Sorting and sequencing games
- Simple quizzes with pictures and spoken prompts

Learning tracks: early math, Swedish, English and general knowledge. Educational prompts must not interrupt play so often that the game feels like a test.

### Create hub

- coloring pages;
- free drawing;
- trace-the-contour activities for shapes, letters and numbers;
- save or export a child's work under parent control.

### Homework hub

First version shipped: parent-configured practice sheets in the hub. Generate printable or on-screen practice from parent-chosen skill, language and level. Keep generation parent-reviewed before a child sees or prints it. Do not send children's names, drawings or performance history to an external model by default.

## First vertical slice

One child profile, one parent-controlled learning track, and one matching game that works on touch and desktop, saves progress locally/server-side, and is installable on a phone home screen.

## Product principles

- Private family-only access through Tailscale initially; no public surface.
- No ads, social feed, chat, public profiles or manipulative streaks.
- Large touch targets, little text, optional spoken instructions and forgiving failure.
- Parent controls are separate from child play mode.
- Track learning progress only when it helps choose the next activity.
- Prefer local, curated question banks before generated child-facing content.
- Treat child profiles, progress and drawings as sensitive data.

## Open product questions

- Which child should the first game fit, and what can they already read/count in Swedish and English?
- Should siblings have separate profiles, and may they play together?
- Is audio important for children who cannot read yet?
- Should drawing work export to Photos/PDF or remain inside the hub?
- What does a useful parent view show without becoming school-like surveillance?

## Locked decisions

- Separate kid profiles with progress tracking.
- Content supports both Swedish preschool-class curriculum goals in mathematics/Swedish and general fun-learning, scaling in difficulty as the children grow.
- Coloring and homework generation use a parent-controlled local model endpoint on the home machine, not a paid cloud API.
- Plan the full ladder now, then build it in review-sized milestones.
