# Tic-tac-toe learning mode

## What it does
Adds a second Play-hub game, "Tre i rad" (tic-tac-toe), alongside the existing
matching game "Parjakten". Two local players share one device and take turns
claiming squares on a 3x3 board. To claim a square, the active player must
first answer a quick multiple-choice question drawn from the same
learning-track content (math, Swedish, English, knowledge) that the matching
game already uses. Three marks in a row, column or diagonal wins and awards
the active profile a star, the same way a correct match does today.

## Component shape

Files:
- `src/features/play/ticTacToe.ts` — new. Pure game logic, no React import.
- `src/features/play/TicTacToe.tsx` — new. The component.
- `src/features/play/ticTacToe.test.ts` — new. Tests for the pure logic in
  `ticTacToe.ts` (winner detection, draw detection, question generation and
  its exhausted-pack fallback), following the style of `src/game.test.ts`.
- `src/App.tsx` — change. Add a play-lane mode switch (below).

`src/features/play/ticTacToe.ts`:
```ts
import { getTrack, type Difficulty, type TrackId } from '../../game'

export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = Cell[]              // length 9, index 0-8, row-major
export type Line = [number, number, number]
export type Question = { prompt: string; options: string[]; correctAnswer: string; pairId: string }

export const WIN_LINES: Line[]           // the 8 winning lines
export const emptyBoard: () => Board     // 9 nulls
export const checkWinner: (board: Board) => { mark: Mark; line: Line } | null
export const isBoardFull: (board: Board) => boolean
export const makeQuestion: (
  trackId: TrackId,
  difficulty: Difficulty,
  random?: () => number,       // default Math.random
  excludePairIds?: string[],   // default []
) => Question
```

`makeQuestion` picks one pair at random from `getTrack(trackId).pairs[difficulty]`,
excluding `excludePairIds` — unless that would leave fewer than 3 candidate
pairs, in which case it falls back to the full pack (same rule `makeDeck`
already applies in `src/game.ts`). `prompt` is `pair.labels[0]`,
`correctAnswer` is `pair.labels[1]`, and `options` is that answer plus two
other pairs' `labels[1]` values, order shuffled using `random`.

`src/features/play/TicTacToe.tsx`:
```tsx
export function TicTacToe({ onWin }: { onWin: () => void }): JSX.Element
```
Mirrors `MatchingGame`'s structure: a track-picker section (reusing `tracks`
from `src/game.ts`), a hero/status section (message + level/reset buttons),
and a game section with the 3x3 grid. Internal state: `board`, `activePlayer`
(`Mark`), `trackId`, `difficulty`, `askedPairIds` (`string[]`), `pending`
(`{ cellIndex: number; question: Question } | null`), `status`
(`'playing' | 'won' | 'draw'`), `message` (string), `winningLine`
(`Line | null`).

Test hooks: board cells use `data-testid={\`cell-${index}\`}`, question
option buttons use `data-testid={\`answer-${index}\`}`, matching the
`data-testid={card.id}` convention in `MatchingGame.tsx`.

`src/App.tsx` change: inside the `hub==='play'` branch, add local state
`playMode: 'matching' | 'tictactoe'` (default `'matching'`) and two small
toggle buttons ("Parjakten" / "Tre i rad") above the game. Render
`<MatchingGame onMatch={award}/>` or `<TicTacToe onWin={award}/>` depending
on `playMode`. `award` is reused unchanged — no changes to `game.ts`,
`HubNav.tsx` or `ProfilePicker.tsx`.

## Behaviour
1. Initial state: board is nine empty cells, `activePlayer` is `'X'`, track
   defaults to `math` difficulty `1`, no question is pending, message shows
   the track's `instruction` text.
2. Tapping an empty cell while no question is pending calls `makeQuestion`
   for the active track/difficulty/`askedPairIds`, stores it as `pending`
   with the tapped cell's index, and disables the whole board.
3. Tapping a filled cell, or any cell while a question is pending, does
   nothing.
4. Choosing the correct answer option: places the active player's mark in
   the pending cell, adds the question's `pairId` to `askedPairIds`, clears
   `pending`, and re-enables the board (unless the game just ended — see 6
   and 7).
5. Choosing a wrong answer option: adds the question's `pairId` to
   `askedPairIds`, clears `pending`, and re-enables the board without
   placing a mark; message shows a "wrong answer — next player's turn" line.
   The turn still passes to the other player (see 8).
6. After a mark is placed, if `checkWinner` finds three of the active
   player's marks in a line: `status` becomes `'won'`, `winningLine` is set
   and visually marked, message announces the winner, the board becomes
   disabled, and `onWin()` fires once.
7. After a mark is placed (or a wrong answer is resolved) that leaves the
   board full with no winner: `status` becomes `'draw'`, message announces
   the draw, the board becomes disabled, `onWin()` does not fire.
8. If `status` is still `'playing'` after a resolved answer (correct or
   wrong), `activePlayer` flips (`X` ↔ `O`) and the message updates to
   prompt the new active player.
9. `askedPairIds` is scoped to the current game (see 10, 11) so the same
   fact does not repeat back-to-back; once the pack is nearly exhausted,
   `makeQuestion`'s fallback (see Component shape) keeps the game supplied
   with questions indefinitely.
10. "Blanda om" (reset) clears the board, `askedPairIds` and any pending
    question, sets `activePlayer` back to `'X'`, and keeps the current
    track/difficulty.
11. Switching track (track-picker button) or difficulty (level button)
    performs the same reset as case 10, against the newly selected
    track/difficulty.
12. Switching the `playMode` toggle away from and back to tic-tac-toe
    unmounts and remounts `TicTacToe`, so it re-enters case 1 with no
    memory of the previous game. It does not affect star counts already
    awarded.

## Out of scope
- A single-player mode against a computer opponent — always two local
  players sharing one device.
- Any change to the learning-track content, tracks list or `game.ts`
  exports beyond what `makeQuestion` reads from them.
- Score or history beyond the existing per-profile star count.
- Persisting an in-progress board across a page reload — state is
  in-memory only, same as `MatchingGame` today.
- Any change to `HubNav`, `ProfilePicker` or the Create hub.

## Open questions
- The Swedish microcopy above ("Fel svar — nästa spelare", win/draw
  announcements) is a draft; confirm final wording with whoever reviews
  child-facing copy before shipping.
- Whether the winning line should get a distinct visual highlight (e.g. a
  `.cell.winning` style) is left to the implementer — neither `App.css` nor
  `create.css` has a precedent for it yet.
