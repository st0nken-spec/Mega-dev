# Navigation redesign: Home → Hub → Activity

## What it does
Restructures the app shell from "everything stacked on one scrolling
page" into three levels, so only one thing is ever on screen at a time:

1. **Home** — replaces the small bottom tab bar (`HubNav`) with three big
   purpose cards: Spela, Skapa, Läxa (Läxa disabled until the Homework hub
   ships — see Open questions).
2. **Hub** — tapping a card shows only that hub's activities as a card
   list (Play: Parjakten/Tre i rad/Siffersnok; Create: Färglägg/Rita
   fritt/Spåra), plus a back link to Home. No other hub's content, and no
   game content, is on screen here.
3. **Activity** — tapping an activity shows only that activity (its
   existing track-picker/hero/board, unchanged), plus a back link to the
   hub's activity list. The activity-picker cards are gone while playing
   — today they stay visible above the game the whole time; this is the
   main decluttering change.

A compact profile bar (name, star count, reset button) is now persistent
across all three levels instead of only existing as a picker on top of
everything, per your call in this conversation. This spec therefore
supersedes `specs/reset-score.md`: the reset behaviour it specifies (arm
on first tap, confirm on second, 3s auto-clear) is implemented here as
part of the new `ProfileBar`, not as a change to the old `ProfilePicker`
card layout. `resetStars` in `game.ts` is unchanged from that spec.

A clickable mockup of this flow (Home → Spela → Parjakten, and back) was
reviewed and approved before this spec was written.

## Component shape

Files:
- `src/App.tsx` — rewritten. New `screen` state (below) replaces `hub`
  and `playMode`. Renders `ProfileBar` once, then the current screen.
- `src/components/ProfileBar.tsx` — new, replaces
  `src/components/ProfilePicker.tsx` (deleted). Compact horizontal row,
  persistent on every screen.
- `src/components/Home.tsx` — new. The three purpose cards.
- `src/components/HubPicker.tsx` — new. Generic activity-card-list,
  reused for Play's and Create's activity pickers (and Homework's later).
- `src/components/ActivityFrame.tsx` — new. Generic "← back / breadcrumb"
  header wrapping whichever activity component is active. The activity
  components themselves (`MatchingGame`, `TicTacToe`, `SnakeGame`,
  `ColoringStudio`, `DrawingStudio`) are **unchanged internally** — this
  only wraps them, it doesn't touch their track-pickers or state.
- `src/components/HubNav.tsx` — deleted (superseded by `Home` + back
  links; there is no persistent bottom nav in the new design).
- `src/features/create/CreateHub.tsx` — deleted. Its two jobs split: the
  three-card picker is now `App.tsx` calling `HubPicker` with Create's
  items; the `mode==='color' ? <ColoringStudio/> : <DrawingStudio
  trace=.../>` switch moves into `App.tsx`, mirroring how Play's game
  switch already lives there today.

`src/App.tsx` new state shape:
```ts
type Hub = 'play' | 'create' | 'homework'
type PlayActivity = 'matching' | 'tictactoe' | 'snake'
type CreateActivity = 'color' | 'draw' | 'trace'
type Screen =
  | { kind: 'home' }
  | { kind: 'hub'; hub: Hub }
  | { kind: 'activity'; hub: 'play'; activity: PlayActivity }
  | { kind: 'activity'; hub: 'create'; activity: CreateActivity }
```
(`hub: 'homework'` has no `'activity'` variant yet — see Open questions.)
State: `screen: Screen` (default `{kind:'home'}`), plus the existing
`profiles`/`activeId`, unchanged.

`src/components/ProfileBar.tsx`:
```tsx
export function ProfileBar({profiles,activeId,onSelect,onReset}:{
  profiles: Profile[]
  activeId: string
  onSelect: (id: string) => void
  onReset: (id: string) => void
}): JSX.Element
```
One row, `profiles.map(...)`: each profile is a compact pill — icon,
name, `{stars} ★`, and a small reset button — sized to sit comfortably at
the top of every screen (roughly the height of the mockup's Home profile
row, not the bigger card treatment). Reset behaviour matches
`specs/reset-score.md`'s cases 1–8 exactly (arm on first tap of that
profile's reset button, confirm on second tap, 3000ms auto-clear, `onSelect`
tap while armed clears the arm) — `ProfileBar` owns the same
`confirmingId`/timer state `ProfilePicker` would have owned. Test hook:
`data-testid={\`profile-reset-${p.id}\`}`.

`src/components/Home.tsx`:
```tsx
export function Home({onSelect}:{onSelect: (hub: Hub) => void}): JSX.Element
```
Three cards (Spela/Skapa/Läxa), styled per the mockup (`Home.dc.html`):
distinct background color per card, icon, name, one-line description,
`›` chevron. Läxa's card is disabled (no `onClick`, `aria-disabled`,
dimmed) until the Homework hub exists.

`src/components/HubPicker.tsx`:
```tsx
export type HubPickerItem = { id: string; icon: string; name: string; description: string }
export function HubPicker({title,subtitle,items,onSelect,onBack}:{
  title: string
  subtitle: string
  items: HubPickerItem[]
  onSelect: (id: string) => void
  onBack: () => void
}): JSX.Element
```
Back link + eyebrow/title + `items.map(...)` as cards (icon, name,
description, chevron), styled per the mockup (`Play.dc.html`/
`Create.dc.html`). `App.tsx` supplies each hub's `items` as a literal
array (three entries for Play, three for Create).

`src/components/ActivityFrame.tsx`:
```tsx
export function ActivityFrame({backLabel,onBack,breadcrumb,children}:{
  backLabel: string
  onBack: () => void
  breadcrumb: string
  children: React.ReactNode
}): JSX.Element
```
Renders `← {backLabel}` (calls `onBack`) then `/ {breadcrumb}`, then
`children` directly below — no extra wrapper styling around `children`,
since the activity component brings its own `.hero`/`.game`/etc.

## Behaviour
1. Initial state: `screen = {kind:'home'}`. `Home` and `ProfileBar` render;
   nothing else.
2. Tapping a `Home` card (Spela/Skapa) sets `screen = {kind:'hub', hub}`.
   `ProfileBar` stays; `Home` is replaced by `HubPicker` for that hub.
3. Tapping a `HubPicker` back link sets `screen = {kind:'home'}` (back to
   case 1).
4. Tapping a `HubPicker` item sets `screen = {kind:'activity', hub,
   activity}`. `HubPicker` is replaced by `ActivityFrame` wrapping the
   matching component (`MatchingGame`/`TicTacToe`/`SnakeGame` for Play;
   `ColoringStudio`/`DrawingStudio` for Create, exactly as `CreateHub.tsx`
   switched them before).
5. Tapping an `ActivityFrame` back link sets `screen = {kind:'hub', hub}`
   (back to case 2's result, that hub's picker) — not all the way to
   Home.
6. Switching activities (case 4 → case 5 → case 4 again with a different
   `activity`) unmounts the previous activity component and mounts the
   new one fresh — each game already resets its own state on mount today
   (e.g. `MatchingGame`'s `useState(()=>makeDeck())`), so this is no
   behaviour change for the games themselves, only for how they're
   shown/hidden.
7. `ProfileBar` renders identically regardless of `screen` — case 1
   through 5 never change what it shows or how reset behaves (see its
   Component shape entry). Selecting a different profile via `ProfileBar`
   does not change `screen`.
8. Awarding a star (`onMatch`/`onWin` from any activity) updates
   `profiles` exactly as today; since `ProfileBar` is always mounted, the
   new star count is visible immediately without navigating anywhere.

## Out of scope
- The Homework hub's own screen — this spec only wires up `Home`'s
  disabled Läxa card and the `Hub`/`Screen` types' room for it; building
  `HomeworkHub` is `specs/homework-hub.md`'s job (PR #17).
- Any change to the games/studios themselves (`MatchingGame.tsx`,
  `ticTacToe.ts`/`TicTacToe.tsx`, `snake.ts`/`SnakeGame.tsx`,
  `ColoringStudio.tsx`, `DrawingStudio.tsx`, `createDomain.ts`,
  `game.ts`) beyond how `App.tsx` mounts them.
- Transition animations between screens — plain mount/unmount, no
  slide/fade, for this pass.
- Deep-linking / URL routing (e.g. a real router, back-button browser
  history) — `screen` is plain component state, lost on reload, same as
  today's `hub`/`playMode` were.
- A "recently played" shortcut on Home, or reordering activities by
  frequency of use — Home always shows the same three cards in the same
  order.

## Open questions
- Läxa's card stays disabled until `specs/homework-hub.md` (PR #17) is
  implemented. When it is, the natural follow-up is: add `'homework'` to
  the `Screen` union's activity variant (or give it a `{kind:'activity',
  hub:'homework'}` with no sub-activity, since `HomeworkHub` picks
  subject/stage internally per its own spec), enable Home's card, and add
  one `HubPicker`-less entry — i.e. Läxa may skip the `HubPicker` level
  and go straight from Home to `HomeworkHub` inside an `ActivityFrame`,
  since it doesn't have Play/Create's "pick one of three games" shape.
  Flagging now rather than guessing, since it affects whether `HubPicker`
  needs a "no items, just go straight there" mode.
- Whether `ActivityFrame`'s back link should show a small home icon
  alongside "← Spela" (jump straight Home from inside an activity,
  skipping the hub picker) wasn't covered by the mockup or this
  conversation; this spec assumes no shortcut (case 5's one-level-back-
  at-a-time only) unless you'd rather have it.
