# Homework hub: practice sheets

## What it does
Unlocks the "Läxa" tab in `HubNav` (currently a disabled placeholder) into
a real Homework hub. A parent picks a subject and a stage — "Förskola" or
"Åk 1" — and gets a 6-question practice sheet built from curated content
grounded in Skolverket's actual curricula (sources below), shown on screen
with an optional answer key and a clean print layout. No AI generation, no
new data collection — both explicitly ruled out for this pass (see Out of
scope): every question is hand-curated content shipped in the app, and
nothing about a generated sheet is stored or leaves the browser.

### Curriculum sources
- **Matematik, åk 1–3 (Lgr22)**: natural numbers 1–100 — ordering,
  comparing, decomposing; the four operations expressed with concrete
  material/pictures/symbols; addition and subtraction via mental and
  written methods. [Skolverket, Lgr22 matematik kursplan](https://www.skolverket.se/undervisning/grundskolan/laroplan-lgr22-for-grundskolan-samt-for-forskoleklassen-och-fritidshemmet/curriculums/LGR22/GRGRMAT01)
- **Svenska, åk 1–3 (Lgr22)**: the sound–letter relationship, decoding
  strategies, shared/individual writing, the alphabet and alphabetical
  order, upper/lowercase rules, common punctuation, spelling of common
  words. [Skolverket, Lgr22 läroplan (PDF)](https://www.skolverket.se/download/18.11f7c7851925054d8c642/1727947566208/pdf13074.pdf)
- **Förskola (Lpfö 18)**: goal areas, not a content list — "Språk och
  kommunikation" and "Matematik... för att undersöka och beskriva sin
  omvärld samt lösa vardagliga problem." [Skolverket, Lpfö 18 (PDF)](https://www.skolverket.se/download/18.6bfaca41169863e6a65d5aa/1553968116077/pdf4001.pdf)
- **Engelska**: no fixed national start point in åk 1–3 — most
  municipalities start teaching English at åk 3, some at åk 1 or 2; this
  is a local decision, not a Skolverket-mandated åk1 requirement.
  [Engelskundervisning i Sverige, Wikipedia](https://sv.wikipedia.org/wiki/Engelskundervisning_i_Sverige)

Because of that English finding, this spec treats English homework as
optional early-vocabulary exposure at both stages (reusing the existing
`english` track unchanged), not as a stage-gated curriculum requirement
the way math and Swedish are.

Because `Kul fakta` maps to Lpfö 18's "Naturvetenskap och teknik" goal
area and åk1's "orientering i närmiljön" (surroundings/nature orientation)
rather than a specific content list either, its existing two packs in
`game.ts` already fit both stages reasonably and are reused unchanged too.

Math and Swedish, by contrast, have concrete Lgr22 central content that
the existing `tracks` pairs (designed for the memory-matching mechanic)
don't cover — no addition/subtraction, no fill-in-the-blank, no
alphabetical ordering. This spec adds new, purpose-built content for
those two subjects (below), authored directly against the sources above.

## Component shape

Files:
- `src/features/homework/homeworkContent.ts` — new. Curated content data
  (below).
- `src/features/homework/homeworkDomain.ts` — new. Pure logic: building
  and shuffling a worksheet.
- `src/features/homework/HomeworkHub.tsx` — new. The component.
- `src/features/homework/homeworkDomain.test.ts` — new. Tests.
- `src/features/homework/README.md` — new, matching the existing
  `play`/`create` lane-ownership convention: "The Homework lane owns this
  directory and Homework-specific tests. It may add its route/screen
  entry through the shared shell (`App.tsx`, `HubNav.tsx`) in a small
  integration commit, but must not edit Play-hub, Create-hub, or
  `game.ts`."
- `src/components/HubNav.tsx` — change. Enable the "Läxa" tab (below).
- `src/App.tsx` — change. Render `HomeworkHub` when `hub==='homework'`.
- `src/App.css` — change. Worksheet layout + a `@media print` rule.

`src/features/homework/homeworkContent.ts`:
```ts
import { tracks, type TrackId } from '../../game'

export type Stage = 'forskola' | 'ak1'
export type HomeworkItem = { id: string; prompt: string; answer: string }
export type HomeworkSubject = {
  id: TrackId
  name: string
  shortName: string
  items: Record<Stage, HomeworkItem[]>
}

export const homeworkSubjects: HomeworkSubject[] = [
  { id: 'math', name: 'Matte', shortName: '123', items: {
    forskola: [
      { id: 'count-1', prompt: 'Hur många prickar? ●', answer: '1' },
      { id: 'count-2', prompt: 'Hur många prickar? ● ●', answer: '2' },
      { id: 'count-3', prompt: 'Hur många prickar? ● ● ●', answer: '3' },
      { id: 'count-4', prompt: 'Hur många prickar? ● ● ● ●', answer: '4' },
      { id: 'count-5', prompt: 'Hur många prickar? ● ● ● ● ●', answer: '5' },
      { id: 'after-4', prompt: 'Vilket tal kommer efter 4?', answer: '5' },
    ],
    ak1: [
      { id: 'add-3-2', prompt: '3 + 2 = ?', answer: '5' },
      { id: 'sub-5-1', prompt: '5 − 1 = ?', answer: '4' },
      { id: 'add-7-3', prompt: '7 + 3 = ?', answer: '10' },
      { id: 'sub-9-4', prompt: '9 − 4 = ?', answer: '5' },
      { id: 'compare-12-21', prompt: 'Vilket tal är störst: 12 eller 21?', answer: '21' },
      { id: 'before-10', prompt: 'Vilket tal kommer före 10?', answer: '9' },
    ],
  }},
  { id: 'swedish', name: 'Svenska', shortName: 'ÅÄÖ', items: {
    forskola: [
      { id: 'sound-katt', prompt: 'Vilken bokstav börjar ordet KATT?', answer: 'K' },
      { id: 'sound-sol', prompt: 'Vilken bokstav börjar ordet SOL?', answer: 'S' },
      { id: 'rhyme-hus-mus', prompt: 'Rimmar HUS på MUS?', answer: 'Ja' },
      { id: 'rhyme-bil-tag', prompt: 'Rimmar BIL på TÅG?', answer: 'Nej' },
      { id: 'upper-a', prompt: 'Vad är stor bokstav av a?', answer: 'A' },
      { id: 'upper-b', prompt: 'Vad är stor bokstav av b?', answer: 'B' },
    ],
    ak1: [
      { id: 'fill-katt', prompt: 'Fyll i den saknade bokstaven: K_TT', answer: 'A' },
      { id: 'fill-sol', prompt: 'Fyll i den saknade bokstaven: S_L', answer: 'O' },
      { id: 'sentence-case', prompt: 'Ska en ny mening börja med stor eller liten bokstav?', answer: 'Stor' },
      { id: 'alpha-order', prompt: 'Vilket ord kommer först i bokstavsordning: BIL eller APA?', answer: 'APA' },
      { id: 'question-mark', prompt: 'Vilket skiljetecken avslutar en fråga?', answer: '?' },
      { id: 'spell-cat', prompt: 'Stava ordet för ett djur som säger "mjau".', answer: 'KATT' },
    ],
  }},
  { id: 'english', name: 'Engelska', shortName: 'ABC', items: {
    forskola: fromTrack('english', 1),
    ak1: fromTrack('english', 2),
  }},
  { id: 'knowledge', name: 'Kul fakta', shortName: '?', items: {
    forskola: fromTrack('knowledge', 1),
    ak1: fromTrack('knowledge', 2),
  }},
]
```
`fromTrack(trackId, difficulty)` is a small local helper (defined above
`homeworkSubjects` in the same file) that reads `tracks` from `../../game`
and maps that pack's `LearningPair[]` into `HomeworkItem[]`:
`pairs.map(pair => ({ id: pair.id, prompt: pair.labels[0], answer:
pair.labels[1] }))`. It exists so English and Kul fakta content has one
source of truth (`game.ts`) instead of being copy-pasted here.

`src/features/homework/homeworkDomain.ts`:
```ts
import { homeworkSubjects, type HomeworkItem, type Stage } from './homeworkContent'
import type { TrackId } from '../../game'

export const getSubject = (id: TrackId) =>
  homeworkSubjects.find(subject => subject.id === id) ?? homeworkSubjects[0]

export const makeWorksheet = (
  subjectId: TrackId,
  stage: Stage,
  random: () => number = Math.random,
): HomeworkItem[] =>
  [...getSubject(subjectId).items[stage]].sort(() => random() - .5)
```

`src/features/homework/HomeworkHub.tsx`:
```tsx
export function HomeworkHub(): JSX.Element
```
State: `subjectId` (`TrackId`, default `'math'`), `stage` (`Stage`,
default `'forskola'`), `worksheet` (`HomeworkItem[]`, from `makeWorksheet`
on mount), `showAnswers` (`boolean`, default `false`). Layout: a
subject-picker section (reusing the `.track-picker`/`.track` classes,
iterating `homeworkSubjects`), a hero/status section (subject name + stage
label, a stage toggle button, a "Nytt blad" regenerate button, a "Visa
facit"/"Dölj facit" toggle, a "Skriv ut" print button), and a
`.worksheet` section: `worksheet.map((item, i) => ...)` rendering a
numbered row with `item.prompt` and either a blank writing line (default)
or `item.answer` next to it (`showAnswers`). Printing calls
`window.print()` directly — no separate print-preview UI.

Test hooks: `data-testid={\`worksheet-item-${i}\`}` on each row.

## Behaviour
1. Initial state: `HubNav`'s "Läxa" tab is enabled; selecting it renders
   `HomeworkHub` with `subjectId='math'`, `stage='forskola'`, a fresh
   `makeWorksheet('math','forskola')`, and `showAnswers=false`.
2. Tapping a subject in the subject-picker sets `subjectId`, keeps
   `stage`, regenerates `worksheet` for the new subject/stage, and resets
   `showAnswers` to `false`.
3. Tapping the stage toggle ("Förskola" ↔ "Åk 1") does the same for the
   new stage, keeping `subjectId`.
4. "Nytt blad" regenerates `worksheet` for the current `subjectId`/`stage`
   (a fresh shuffle of the same 6 items) and resets `showAnswers` to
   `false`.
5. "Visa facit"/"Dölj facit" toggles `showAnswers`; while `true`, every
   row shows its answer next to the blank, on screen only (see case 7).
6. Each worksheet row is numbered 1–6 and shows `item.prompt` plus a
   blank line sized for a child's handwriting.
7. "Skriv ut" calls `window.print()`. A `@media print` rule hides
   `header`, `.profiles`, `.hub-link`/`nav`, `.track-picker`, and all of
   `HomeworkHub`'s own control buttons, leaving only the worksheet
   content — and always hides answer text regardless of `showAnswers`'s
   on-screen state, so a parent can't accidentally print an
   already-answered sheet.
8. Switching away from the Homework hub (via `HubNav`) and back re-mounts
   `HomeworkHub` with fresh state (case 1) — nothing about a specific
   sheet persists across hub switches.

## Out of scope
- Any AI/LLM-generated content — ruled out for this pass; every item is
  hand-curated and shipped in `homeworkContent.ts` or reused from
  `game.ts`.
- Any new data storage — no new `localStorage` key; nothing about a
  generated sheet, a print action, or which subject/stage was used is
  persisted or leaves the browser.
- Full Lgr22/Lpfö18 content coverage — 6 items per subject per stage is a
  starter set illustrating the curriculum areas above, not an exhaustive
  curriculum. Expanding it is expected future work, not part of this
  spec.
- A question-count control, free-text question editing, star/profile
  integration, and PDF export beyond the browser's own print-to-PDF — all
  out of scope, same reasoning as the original draft of this spec.
- Read-aloud/audio support for prompts.

## Open questions
- Some förskola-stage prompts (e.g. "Rimmar HUS på MUS?") assume a parent
  reads the question aloud to a pre-reader; there's no audio support (see
  Out of scope), so this sheet type may need a parent sitting with the
  child rather than being fully independent seatwork. Worth confirming
  that's the intended usage model.
- Whether to expand each subject/stage beyond 6 items (or add more
  subjects/stages) is future work — this spec deliberately ships a small,
  well-sourced starter set rather than guessing at full curriculum
  coverage.
