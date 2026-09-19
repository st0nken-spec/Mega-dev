# Reset profile score

## What it does
Adds a small reset control to each profile card (next to "Räven"/"Björnen"
in the profile picker at the top of the app) so a parent can start a
profile's star count over. Tapping it once arms a confirmation; tapping it
again resets that profile's stars to 0. It does not touch the other
profile, the active-profile selection, or anything else about the profile.

## Component shape

Files:
- `src/game.ts` — change. Add one function, alongside `awardStar`:
  ```ts
  export const resetStars = (profiles: Profile[], id: string): Profile[] =>
    profiles.map(profile => profile.id === id ? { ...profile, stars: 0 } : profile)
  ```
- `src/components/ProfilePicker.tsx` — change. New prop `onReset: (id:
  string) => void`; each profile card gains a reset button and local
  confirm-arming state (below).
- `src/App.tsx` — change. Add a `resetScore` handler mirroring `award`,
  passed to `ProfilePicker` as `onReset`:
  ```ts
  const resetScore = (id: string) => setProfiles(items => {
    const updated = resetStars(items, id)
    localStorage.setItem('mega-profiles', JSON.stringify(updated))
    return updated
  })
  ```
  (`resetStars` imported from `./game` alongside the existing `awardStar`
  import.)

`ProfilePicker.tsx` new shape:
```tsx
export function ProfilePicker({profiles,activeId,onSelect,onReset}:{
  profiles: Profile[]
  activeId: string
  onSelect: (id: string) => void
  onReset: (id: string) => void
}): JSX.Element
```
Each profile is no longer one big `<button>` (a reset `<button>` can't
nest inside it). Restructure each card as a `<div className="profile...">`
containing two buttons stacked vertically:
1. `.profile-select` — a button with the icon + name, `onClick={() =>
   onSelect(p.id)}`, `aria-pressed={p.id===activeId}` — this is the large
   tap target that replaces the old whole-card button.
2. A `.profile-stars` row below it: the `{p.stars} stjärnor` text plus a
   small `.profile-reset` button.

Internal state (in `ProfilePicker`, since the confirm-arming is per-picker
UI state, not app state): `confirmingId: string | null` and a
`window.setTimeout` id held in a ref, so only one card can be armed at a
time and it auto-clears after 3000ms.

Test hooks: `data-testid={\`profile-reset-${p.id}\`}` on each reset button.

CSS (`src/App.css`): replace the current `.profile{...grid-template-columns:auto
auto...}` rule (icon spanning two rows beside name+stars) with a single-column
stack: icon+name on top (inside `.profile-select`), stars+reset button below
(inside `.profile-stars`). Reuse the existing color tokens (`#174f42` active
border/bg `#effaf4`, muted text `#61766f`) already used elsewhere in this
file; the reset button itself is small (e.g. a 26px circular button) so it
doesn't compete visually with the name/select button.

## Behaviour
1. Initial state: no profile's reset is armed (`confirmingId` is `null`);
   every profile card shows its normal "↺" reset button next to its star
   count.
2. Tapping a profile's reset button while nothing is armed (or while a
   *different* profile's reset is armed) does not reset anything — it sets
   `confirmingId` to that profile's id, changes that button's label/state
   to a confirm prompt (e.g. "Säker?"), and (re)starts a 3000ms timer.
3. Tapping the same profile's reset button again while it is the armed one
   (`confirmingId === p.id`) calls `onReset(p.id)`, clears `confirmingId`
   and the timer, and the button returns to its normal "↺" state.
4. If 3000ms pass with no second tap, `confirmingId` clears automatically
   (back to case 1) and nothing is reset.
5. Tapping a profile's *select* button (the name/icon button) while any
   reset is armed clears `confirmingId` (case 1) without resetting
   anything, in addition to its normal `onSelect` behaviour.
6. `resetStars` only changes the target profile's `stars` to `0`; `id`,
   `name`, `level`, the other profile, and `activeId` are all unchanged.
   The reset profile does not become the active one as a side effect (it
   only becomes active if the parent also taps its select button).
7. A profile whose `stars` is already `0` behaves identically (arm, then
   confirm) — the control is never disabled, since re-confirming a
   no-op reset is harmless.
8. The component unmounting (e.g. hub switch, if `ProfilePicker` is ever
   conditionally rendered in the future) clears the pending timer so it
   can't fire against an unmounted component.

## Out of scope
- A single "reset all profiles" control — each profile has its own.
- Any undo — once confirmed, the previous count isn't recoverable except
  by re-earning stars.
- A modal/dialog for confirmation — the two-tap arm/confirm on the button
  itself is the entire confirmation mechanism.
- Any change to `awardStar`, `loadProfiles`, `initialProfiles`, profile
  `level`, or adding/removing profiles.
- Any change to `HubNav` or the play games themselves.

## Open questions
- The 3000ms auto-clear window is a guess; tune it (or make it longer/
  shorter) after watching a parent actually use it.
- Whether resetting should require anything stronger than a second tap
  (e.g. a long-press, or being gated behind a "parent mode") is
  unresolved — this spec assumes a second tap is enough since the control
  is meant for a parent, not a child, to use, but flagging since there's
  no existing parent/child mode distinction in this app to gate it behind.
