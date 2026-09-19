# Snake learning mode

## What it does
Adds a third Play-hub game, "Ormen" (Snake), alongside "Parjakten" (matching)
and "Tre i rad" (tic-tac-toe). A snake moves continuously on a 9x9 grid,
steered by four on-screen direction buttons. At any time the board shows a
few food items, one of which is the correct answer to the current
learning-track question; eating it grows the snake, answers correctly, and
serves a new question. Eating a wrong-answer food, or hitting the wall or
its own body, ends the round. Every 5 correct catches awards the active
profile a star, the same way a correct match or a tic-tac-toe win does
today.

## Component shape

Files:
- `src/features/play/quiz.ts` — new. Extracts the `Question` type and
  `makeQuestion` function out of `src/features/play/ticTacToe.ts` verbatim
  (no behaviour change), so both games can share the same question logic.
- `src/features/play/ticTacToe.ts` — change. Remove its own `Question`
  type and `makeQuestion` definition; re-export both from `./quiz` instead
  (`export { type Question, makeQuestion } from './quiz'`), so
  `TicTacToe.tsx`'s existing `import {..., type Question} from './ticTacToe'`
  keeps working unchanged. `TicTacToe.tsx` itself is not touched.
- `src/features/play/snake.ts` — new. Pure game logic, no React import.
- `src/features/play/Snake.tsx` — new. The component.
- `src/features/play/snake.test.ts` — new. Tests for the pure logic in
  `snake.ts` (movement, collisions, food placement), following the style of
  `src/features/play/ticTacToe.test.ts`.
- `src/App.tsx` — change. Extend the `PlayMode` type and toggle (below).

`src/features/play/snake.ts`:
```ts
import type { Question } from './quiz'

export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'
export type Food = { point: Point; label: string; correct: boolean }

export const GRID_SIZE = 9
export const TICK_MS = 450
export const CATCHES_PER_STAR = 5

export const initialSnake: () => Point[]   // 3 segments, head first, centre row, facing right
export const nextHead: (head: Point, direction: Direction) => Point
export const isOpposite: (a: Direction, b: Direction) => boolean
export const isOutOfBounds: (point: Point, size?: number) => boolean
export const hitsBody: (point: Point, segments: Point[]) => boolean
export const placeFoods: (
  question: Question,
  occupied: Point[],
  random?: () => number,  // default Math.random
  size?: number,          // default GRID_SIZE
) => Food[]                // one Food per question.options entry, at distinct empty points not in `occupied`
```
`hitsBody` takes whatever slice of the snake the caller passes — see
Behaviour case 6 for why the tail segment must sometimes be excluded before
calling it.

`src/features/play/Snake.tsx`:
```tsx
export function Snake({ onWin }: { onWin: () => void }): JSX.Element
```
Mirrors `TicTacToe`'s structure: a track-picker section (reusing `tracks`),
a hero/status section (message + level/reset buttons), a `GRID_SIZE` x
`GRID_SIZE` game grid (snake segments, food labels or empty cells), and a
4-button directional pad ("↑"/"↓"/"←"/"→") below the grid calling a
`turn(direction: Direction)` handler. Internal state: `trackId`,
`difficulty`, `snake` (`Point[]`), `direction` (`Direction`),
`askedPairIds` (`string[]`), `question` (`Question`), `foods` (`Food[]`),
`correctCatches` (`number`), `status` (`'playing' | 'over'`), `message`
(string). A `useEffect` runs `window.setInterval(tick, TICK_MS)` while
`status==='playing'` and clears it on unmount or when `status` becomes
`'over'`.

Test hooks: grid cells use `data-testid={\`snake-cell-${x}-${y}\`}`,
direction buttons use `data-testid="dir-up"` / `"dir-down"` / `"dir-left"`
/ `"dir-right"`.

## Behaviour
1. Initial state: `snake` is `initialSnake()` (3 segments, facing right) on
   a `GRID_SIZE`x`GRID_SIZE` grid, track defaults to `math` difficulty `1`,
   `question` is `makeQuestion('math', 1)`, `foods` is `placeFoods(question,
   snake)`, `correctCatches` is 0, `status` is `'playing'`, message shows
   the track's `instruction` plus the question's `prompt` (e.g. "Hitta
   talet och lika många prickar — hitta: 2").
2. On each tick while `status==='playing'`: compute
   `nextHead(snake[0], direction)`.
3. Tapping a direction button records it as the direction to use on the
   *next* tick, unless it `isOpposite` to the current `direction` (a snake
   can't reverse into itself) — that tap is ignored. Tapping the current
   direction is a no-op.
4. If the computed head `isOutOfBounds`, or `hitsBody(head,
   snake.slice(0, -1))` (the tail is excluded because it vacates this cell
   the same tick, unless the move is a growing move per case 5 — in which
   case check against the full `snake`, though this can never fire since a
   food cell is by construction never a snake cell): `status` becomes
   `'over'`, the interval is cleared, and message shows a crash line with
   the round's `correctCatches` (e.g. "Kraschade! 3 rätt den här
   omgången.").
5. If the computed head lands on the food marked `correct`: the snake
   grows (new head is prepended, tail is **not** dropped), `correctCatches`
   increments by 1, the food's `pairId` is added to `askedPairIds`, a new
   `question` is generated (`makeQuestion` with the updated
   `askedPairIds`, same exhausted-pack fallback as tic-tac-toe), new
   `foods` are placed for it against the grown snake, and message updates
   to the new question's prompt (prefixed "Rätt! "). If `correctCatches`
   has just reached a multiple of `CATCHES_PER_STAR`: `onWin()` also fires
   once (see case 8 — this does not otherwise change the round).
6. If the computed head lands on a food marked not `correct`: treated the
   same as case 4 (round over), with the food's label used only for the
   message text (e.g. "Fel svar! Kraschade! ...").
7. Otherwise (empty, in-bounds, non-colliding cell): the snake moves
   normally — new head prepended, tail dropped — and message is unchanged.
8. `onWin()` can fire more than once in a single round (once per
   `CATCHES_PER_STAR` catches); each call awards the active profile one
   star exactly like a call from `MatchingGame` or `TicTacToe`. Snake has
   no separate per-round "won" status the way tic-tac-toe does — a round
   only ends via `status==='over'` (case 4/6).
9. "Blanda om" (reset), or switching track (track-picker) or difficulty
   (level button), performs the same reset as case 1 against the current
   or newly selected track/difficulty, cancels any pending direction
   change, and restarts the tick interval.
10. Switching the `playMode` toggle away from and back to Snake unmounts
    and remounts the component (the interval is cleared on unmount by the
    `useEffect` cleanup), so it re-enters case 1 with no memory of the
    previous round. It does not affect star counts already awarded.

## Out of scope
- Persisting a high score, or `correctCatches`, beyond the current round —
  only the existing per-profile star count persists (in `localStorage`,
  unchanged).
- Touch swipe or keyboard-arrow input — steering is the four on-screen
  buttons only.
- Any change in tick speed, whether over time or by difficulty —
  `TICK_MS` is constant regardless of `difficulty`.
- Wraparound at the grid edges — leaving the grid always ends the round.
- Pause/resume.
- Guarding `placeFoods` against a snake long enough to fill most of the
  board — the grid (81 cells) is assumed to stay mostly empty for any
  round a child actually plays; not handled here.
- Any change to `HubNav`, `ProfilePicker`, `MatchingGame`, `TicTacToe.tsx`'s
  behaviour, or the track content in `game.ts`.

## Open questions
- `GRID_SIZE=9` and `TICK_MS=450` are starting guesses for a touch-friendly
  phone/tablet session; ROADMAP.md M3's exit criteria calls for tuning
  difficulty/pacing in child testing, so expect these to change.
- `CATCHES_PER_STAR=5` means Snake awards stars at a different pace than
  Tre i rad (one star per completed game) or Parjakten (one star per
  correct match). Whether star pacing should be made consistent across the
  three games is unresolved — flagging rather than guessing at a shared
  formula.
