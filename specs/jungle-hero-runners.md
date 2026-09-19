# Jungle Run & Hero Training: two learning runner games

## What it does
Adds two new Play-hub games, built on a shared "runner" engine, expanding
`TARZAN-BACKLOG.md`'s two research entries into buildable specs now that
the shared profile/content/progress systems that doc asked to wait for
(`game.ts`'s tracks, the Home/HubPicker/ActivityFrame shell, per-profile
stars) are in place.

- **Jungle Run** ("Djungellöpet") — an original run/jump/duck platformer
  inspired by the *feel* of Disney's Tarzan (1999, Eurocom): three
  stages — a treetop skills course, a stampede-style forced chase, and a
  pattern-based guardian-cat boss fight.
- **Hero Training** ("Hjältebanan") — an original side-scroller inspired
  by the *feel* of Disney's Hercules Action Game (1997, Eurocom): a
  training course, a runner's-path chase stage, and a guardian boss fight
  with a **different** mechanic from Jungle Run's boss, so the two games
  don't feel like reskins of each other.

Both use **only original characters, names, art direction and level
layouts** — per `TARZAN-BACKLOG.md`'s own explicit requirement, which
this spec follows. Nothing here reproduces Disney IP; the research below
is used only to identify *stage-type variety and pacing*, which is what
stops a "backlog runner game" from shipping as one level that loops.

### Research grounding (stage variety, not content)
Both source games were researched for their full level lists and stage
*types*, specifically to identify the variety needed:

- **Disney's Tarzan (1999)** shipped 13 stages of clearly different
  types: an intro platforming/skills stage ("Welcome to the Jungle"), a
  training stage ("Going Ape"), a collectible-dare stage ("The Elephant
  Hair Dare"), a forced-run chase away from a stampede, a boss fight
  against the predator Sabor, a chase stage, camp-infiltration stages
  against human hunters, an exploration stage, a boat/river stage with
  different traversal, a rescue stage, and a final boss (Clayton).
  [Wikipedia](https://en.wikipedia.org/wiki/Disney's_Tarzan_(video_game)),
  level list via [MobyGames](https://www.mobygames.com/game/1308/disneys-tarzan/)
  and contemporary reviews
  ([GameSpot](https://www.gamespot.com/reviews/tarzan-review/1900-2546076/),
  [IGN](https://www.ign.com/articles/1999/08/14/tarzan-action-game)).
- **Disney's Hercules Action Game (1997)** shipped ~10 stages: a
  no-boss training course, an over-the-shoulder rush stage with speed
  power-ups, a platforming stage ending in a boss you ride on the back
  of to deplete its health (Nessus), a city stage with traffic hazards
  ending in a different boss fight, two boss-*only* stages that each use
  a distinct mechanic (chop the Hydra's regrowing heads; reflect
  Medusa's petrifying gaze with a shield), a Cyclops-themed stage, a
  flight/rush stage against Titans, an atmospheric underworld
  platforming stage, and a final boss (Hades).
  [Wikipedia](https://en.wikipedia.org/wiki/Hercules_(1997_video_game)),
  stage/boss detail via
  [GameSpot](https://www.gamespot.com/reviews/hercules-action-game-review/1900-2547881/)
  and [Gamebits](https://www.gamebits.net/psx/hercules/).

The throughline this spec keeps: **every stage in a game is a different
type**, and **every boss fight uses a mechanic no other boss in either
game uses**. That's the concrete answer to "don't make one level that
loops."

## Component shape

Files (new, in `src/features/play/runner/`, per the play lane's
ownership of this directory):
- `runnerEngine.ts` — shared pure logic used by both games' chase stages
  and the platforming stages' movement.
- `runnerEngine.test.ts` — tests for it.
- `jungleRunContent.ts` — Jungle Run's three stage definitions.
- `JungleRun.tsx` — the Jungle Run component (stage sequencer + the
  three stages).
- `heroTrainingContent.ts` — Hero Training's three stage definitions.
- `HeroTraining.tsx` — the Hero Training component.
- `runner.css` (or additions to `App.css`, implementer's call) — lane
  track, obstacle, and boss-arena styles.

`App.tsx` changes: add `'jungleRun' | 'heroTraining'` to `PlayActivity`,
two more entries in `playItems`, two more `playNames` entries, and two
more branches in the Play `ActivityFrame` switch — same pattern as
adding Siffersnok.

### Shared engine (`runnerEngine.ts`)
Both games' forced-run stages (and Jungle Run's treetop stage) are DOM/CSS
based, tick-driven — the same pattern `SnakeGame`/`snake.ts` already
established (a `window.setInterval` tick advancing pure state), not
canvas. Three lanes, not a 2D grid: obstacles approach from the right
(or top, mirroring Siffersnok's approach if that reads better on a
phone), the player picks a lane and an action.

```ts
export type Lane = 0 | 1 | 2
export type Action = 'run' | 'jump' | 'duck'
export type ObstacleKind = 'jump' | 'duck' | 'question'
export type Obstacle = { id: string; lane: Lane; distance: number; kind: ObstacleKind; questionId?: string }
export type RunState = {
  lane: Lane
  action: Action
  distance: number
  obstacles: Obstacle[]
  tokens: number
  status: 'running' | 'crashed' | 'clear'
}

export const TICK_MS = 300
export const LANE_COUNT = 3

export const spawnObstacle: (distance: number, random?: () => number) => Obstacle
export const clearsObstacle: (action: Action, obstacle: Obstacle) => boolean
// 'jump' obstacles require action==='jump', 'duck' require action==='duck',
// 'question' obstacles require the lane to match makeQuestion's correct answer
// (reusing ./quiz.ts's Question/makeQuestion, same track/difficulty system
// every other game already uses) placed across the 3 lanes as multiple choice,
// exactly like the lane-switch idea TARZAN-BACKLOG.md itself proposed.
export const advance: (state: RunState, input: { lane?: Lane; action?: Action }, stageLength: number, random?: () => number) => RunState
```

`advance` is the single pure step function (mirrors `Snake.tsx`'s
`advance`): moves `distance` forward one tick, spawns a new obstacle when
due, checks collision against any obstacle now at the player's current
`distance`, sets `status:'crashed'` on a miss or `status:'clear'` once
`distance>=stageLength`. No lives/game-over spiral — a crash restarts
just that stage (see Behaviour), matching `TARZAN-BACKLOG.md`'s explicit
"no lost lives" requirement for both games.

## Jungle Run ("Djungellöpet")

Three stages, each a genuinely different type, run in sequence:

1. **Trädkronorna** (Treetops) — a slow-paced platforming/collection
   stage. Not a chase: the child explores at their own pace along a
   single lane, collecting learning tokens (drawn from the selected
   track/difficulty, reusing `tracks`) that appear as `makeQuestion`-style
   prompts — collect the token matching the current prompt's correct
   answer among 2-3 shown. Teaches the controls (jump/duck) with no fail
   state; it's this game's tutorial.
2. **Flykten** (The Escape) — the stampede-inspired forced-run chase
   stage, using `runnerEngine`: constant forward auto-scroll, the player
   only controls lane and action, obstacles include `'question'`-kind
   ones (pick the lane with the right answer) alongside plain
   `'jump'`/`'duck'` obstacles. A crash resets to the start of this stage
   only (see Behaviour case 5).
3. **Vaktkatten** (The Guardian Cat) — an original big-cat boss, not from
   `runnerEngine`. Fixed arena, the cat telegraphs one of 2-3 attacks
   (a visible wind-up beat before each), the child dodges (lane-switch)
   or ducks; after a successful dodge, a `makeQuestion` prompt opens a
   "shield" window (matches `TARZAN-BACKLOG.md`'s "boss shield opens
   after a correct, age-scaled choice") during which the boss is
   vulnerable to one hit. 3 hits clears the boss and the game, awarding
   one star.

## Hero Training ("Hjältebanan")

Three stages, deliberately shaped differently from Jungle Run's so nothing
about either game repeats:

1. **Träningsbanan** (The Training Course) — Jungle Run's Trädkronorna
   equivalent in *purpose* (a no-fail tutorial) but different in *shape*:
   a short fixed obstacle course (climb, swing, jump — reusing the same
   jump/duck actions) with no lane-switching and no collectibles, just
   movement practice. Deliberately simpler than Jungle Run's tutorial so
   the two don't feel like the same stage reskinned.
2. **Löparleden** (The Runner's Path) — `runnerEngine`'s forced-run
   stage again, but themed and paced differently (faster `TICK_MS`, an
   implementer's call — see Open questions) with its own obstacle mix.
3. **Portvakten** (The Gate Guardian) — an original guardian boss whose
   mechanic is explicitly **not** dodge-and-counter like Vaktkatten:
   instead it mirrors Nessus's "endure and outlast" shape — the boss
   attacks on a fixed rhythm the child must block (a single "block"
   action, held during the telegraphed window) rather than dodge, and a
   `makeQuestion` prompt after every 2 successful blocks advances a
   progress meter; the meter filling (not a hit-point countdown) clears
   the boss. A different win-condition shape from Vaktkatten's 3-hits,
   on purpose.

## Behaviour
1. Both games' initial state: stage 1 of 3, track/difficulty pickers
   (reusing `tracks`, same track-picker component convention as the
   other games) default to `math`/`1`, `runState`/equivalent is fresh.
2. Clearing a stage (`status==='clear'` for a runner stage, or the boss
   defeated) advances to the next stage with a short transition message;
   clearing stage 3 awards one star via the existing `onWin`-style
   callback and shows a completion message.
3. A crash in a chase stage (case: `status==='crashed'`) does **not**
   fail the whole game — it restarts that stage from its beginning, same
   track/difficulty, with a brief "try again" message. No lives, no
   game-over screen, matching the "no lost lives" requirement both games
   share.
4. Tapping "Blanda om" (or equivalent reset control) at any point restarts
   the whole 3-stage sequence from stage 1 with the current track/
   difficulty.
5. Switching track or difficulty restarts the whole sequence against the
   new selection (same convention as every other game's track-picker).
6. A `'question'`-kind obstacle or boss-shield prompt that runs out
   (child doesn't act before the obstacle reaches them, or the boss
   telegraph window closes) counts as a miss (case 3), not as "wrong
   answer" being scored differently from "no answer" — both are just "try
   again," keeping this forgiving per `TARZAN-BACKLOG.md`'s explicit
   design notes.
7. An optional "pure-fun mode" toggle (per `TARZAN-BACKLOG.md`) removes
   all `'question'`-kind obstacles/prompts from both games, leaving only
   plain jump/duck obstacles and the boss's dodge/block mechanic — for a
   child who wants to just play without the learning layer.

## Out of scope
- The full 13/10-level scope of the original games — this ships 3
  stages per game (a vertical slice with genuine type variety), not a
  full campaign. `TARZAN-BACKLOG.md` itself calls for "a one-level
  input/performance spike" first; this spec is already more than that,
  and further stages are natural follow-up work once this slice is
  proven, not part of this PR.
- Canvas rendering, sprite animation, or any asset pipeline — stages are
  DOM/CSS, same rendering approach as every other game in this repo.
- Any persistence beyond the existing per-profile star — no per-stage
  high scores, no save-mid-game.
- Multiplayer or two-player modes.
- Sound.
- Reproducing any Disney character, name, music cue, or level layout —
  explicitly ruled out per `TARZAN-BACKLOG.md` and kept ruled out here.

## Open questions
- Exact `TICK_MS`, obstacle spawn spacing, and stage length (the
  `stageLength` parameter) are starting guesses; both games' pacing
  needs tuning in child testing, same as Snake's grid size/speed were
  flagged as open in `specs/snake.md`'s spirit (that spec's underlying
  Siffersnok implementation ended up different from what was written,
  worth remembering when this one gets implemented).
- Portrait phone-width lanes: whether 3 lanes are arranged
  vertically-stacked (like Siffersnok reads top-to-bottom) or as 3
  horizontal tracks (like a traditional runner) isn't settled — pick
  whichever reads clearer at 390px width during implementation and note
  the choice in the PR.
- Whether `runnerEngine.ts` should also power a future addition from
  `TARZAN-BACKLOG.md`'s "more revival candidates" section (Crate Dash,
  Ring Rush, etc.) is worth keeping in mind architecturally but is not
  designed here.
