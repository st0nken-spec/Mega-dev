import { useEffect, useState } from 'react'
import { getTrack, tracks, type Difficulty, type TrackId } from '../../../game'
import { DifficultyControl } from '../../../components/DifficultyControl'
import { TrackPicker } from '../../../components/TrackPicker'
import { makeQuestion, type Question } from '../ticTacToe'
import { advance, createRun, TICK_MS, VIEW_DISTANCE, type Action, type Lane, type Obstacle, type RunState } from './runnerEngine'
import { createGuardian, HITS_TO_WIN, landHit, missShield, tickGuardian, type GuardianState } from './guardian'
import { attackHint, jungleStages, tutorialSteps } from './jungleRunContent'
import './runner.css'

const stageLength = (difficulty: Difficulty) => difficulty === 1 ? 12 : 16
const chaseTick = (difficulty: Difficulty) => difficulty === 1 ? TICK_MS + 160 : TICK_MS + 40
const BOSS_TICK_MS = 900
const telegraphTicks = (difficulty: Difficulty) => difficulty === 1 ? 4 : 3
const WIN_MESSAGE = 'Djungeln är trygg! Du klarade hela äventyret.'

export function JungleRun({ difficulty, onDifficultyChange, onWin }: { difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void; onWin: () => void }) {
  const [trackId, setTrackId] = useState<TrackId>('math')
  const [stage, setStage] = useState(0)
  const [fun, setFun] = useState(false)
  const [step, setStep] = useState(0)
  const [question, setQuestion] = useState<Question>(() => makeQuestion('math', difficulty))
  const [run, setRun] = useState<RunState>(createRun)
  const [boss, setBoss] = useState<GuardianState>(() => createGuardian(Math.random, telegraphTicks(difficulty)))
  const [bossLane, setBossLane] = useState<Lane>(1)
  const [bossAction, setBossAction] = useState<Action>('run')
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState<string>(jungleStages[0].description)
  const track = getTrack(trackId)
  const steps = tutorialSteps(fun)
  const questionSource = fun ? undefined : () => makeQuestion(trackId, difficulty)

  const restart = (nextTrack = trackId, nextDifficulty = difficulty, nextFun = fun) => {
    setTrackId(nextTrack)
    onDifficultyChange(nextDifficulty)
    setFun(nextFun)
    setStage(0)
    setStep(0)
    setQuestion(makeQuestion(nextTrack, nextDifficulty))
    setRun(createRun())
    setBoss(createGuardian(Math.random, telegraphTicks(nextDifficulty)))
    setBossLane(1)
    setBossAction('run')
    setWon(false)
    setMessage(jungleStages[0].description)
  }

  const nextStage = () => {
    const next = stage + 1
    if (next > 2) { setWon(true); onWin(); setMessage(WIN_MESSAGE); return }
    setStage(next)
    setStep(0)
    setRun(createRun())
    setBoss(createGuardian(Math.random, telegraphTicks(difficulty)))
    setBossLane(1)
    setBossAction('run')
    setMessage(jungleStages[next].description)
  }

  useEffect(() => {
    if (stage !== 1 || run.status !== 'running' || won) return
    const timer = window.setInterval(() => setRun(current => advance(current, {}, stageLength(difficulty), Math.random, questionSource)), chaseTick(difficulty))
    return () => clearInterval(timer)
  })

  // oxlint-disable-next-line react-hooks/exhaustive-deps, react/set-state-in-effect -- stage transitions respond to the pure engine status
  useEffect(() => {
    if (stage !== 1) return
    if (run.status === 'clear') nextStage()
    if (run.status === 'crashed') { setMessage('Nästan! Flykten börjar om.'); setRun(createRun()) }
  }, [run.status])

  useEffect(() => {
    if (stage !== 2 || boss.phase !== 'telegraph' || won) return
    const timer = window.setInterval(() => {
      const result = tickGuardian(boss, bossLane, bossAction)
      setBoss(result.state)
      if (result.outcome === 'ongoing') return
      setBossAction('run')
      if (result.outcome === 'hit-player') { setMessage('Vaktkatten hann fram! Försök igen.'); return }
      if (fun) {
        const hit = landHit(result.state)
        setBoss(hit.state)
        if (hit.outcome === 'won') { setWon(true); onWin(); setMessage(WIN_MESSAGE) }
        else setMessage(`Du undvek attacken och träffade! ${hit.state.hits} av ${HITS_TO_WIN}.`)
      } else {
        setQuestion(makeQuestion(trackId, difficulty))
        setMessage('Skölden öppnades! Svara rätt för att träffa.')
      }
    }, BOSS_TICK_MS)
    return () => clearInterval(timer)
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (won) return
      if (stage === 0) {
        if (event.key === ' ' || event.key === 'ArrowUp') { event.preventDefault(); tutorialMove('jump') }
        if (event.key === 'ArrowDown') { event.preventDefault(); tutorialMove('duck') }
      } else if (stage === 1) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(run.lane > 0 ? (run.lane - 1) as Lane : 0) }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(run.lane < 2 ? (run.lane + 1) as Lane : 2) }
        if (event.key === ' ' || event.key === 'ArrowUp') { event.preventDefault(); move(undefined, 'jump') }
        if (event.key === 'ArrowDown') { event.preventDefault(); move(undefined, 'duck') }
      } else if (stage === 2) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); setBossLane(current => current > 0 ? (current - 1) as Lane : 0) }
        if (event.key === 'ArrowRight') { event.preventDefault(); setBossLane(current => current < 2 ? (current + 1) as Lane : 2) }
        if (event.key === ' ' || event.key === 'ArrowDown') { event.preventDefault(); setBossAction('duck') }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const tutorialMove = (kind: 'jump' | 'duck' | 'lane') => {
    const current = steps[step]
    if (!current || current.kind !== kind) { setMessage(`Prova igen - ${current?.prompt ?? ''}`); return }
    const next = step + 1
    if (next >= steps.length) { nextStage(); return }
    setStep(next)
    setMessage(`Bra! Frö ${next} av ${steps.length}.`)
  }

  const answerTutorial = (option: string) => {
    if (option !== question.correctAnswer) { setMessage('Försök igen!'); return }
    const next = step + 1
    if (next >= steps.length) { nextStage(); return }
    setStep(next)
    setQuestion(makeQuestion(trackId, difficulty))
    setMessage(`Bra! Frö ${next} av ${steps.length}.`)
  }

  const answerShield = (option: string) => {
    if (option !== question.correctAnswer) { setBoss(current => missShield(current)); setMessage('Inte riktigt! Vaktkatten samlar sig igen.'); return }
    const hit = landHit(boss)
    setBoss(hit.state)
    if (hit.outcome === 'won') { setWon(true); onWin(); setMessage(WIN_MESSAGE) }
    else setMessage(`Träff! ${hit.state.hits} av ${HITS_TO_WIN}.`)
  }

  const move = (lane?: Lane, action?: Action) => {
    if (stage !== 1 || run.status !== 'running') return
    setRun(current => advance(current, { lane, action }, stageLength(difficulty), Math.random, questionSource))
  }

  const visible = (item: Obstacle) => item.distance > run.distance && item.distance - run.distance <= VIEW_DISTANCE
  const banner = run.obstacles.filter(item => item.kind === 'question' && visible(item)).sort((a, b) => a.distance - b.distance)[0]

  return <section className="runner-panel" aria-label="Djungellöpet">
    <TrackPicker items={tracks} activeId={trackId} onSelect={id => restart(id, difficulty)} />
    <section className="runner-hero">
      <div>
        <p className="eyebrow">{track.name.toUpperCase()} · NIVÅ {difficulty}</p>
        <h2>Djungellöpet</h2>
        <p aria-live="polite">Bana {stage + 1}: {jungleStages[stage]?.name}. {message}</p>
      </div>
      <div className="runner-actions">
        <DifficultyControl value={difficulty} onChange={level => restart(trackId, level)} />
        <button aria-pressed={fun} className="reset" onClick={() => restart(trackId, difficulty, !fun)}>{fun ? 'Lärläge' : 'Bara lek'}</button>
        <button className="reset" onClick={() => restart()}>Börja om</button>
      </div>
    </section>
    <div className="stage-dots" aria-label={`Bana ${stage + 1} av 3`}>{jungleStages.map((item, index) => <span className={index === stage ? 'active' : ''} key={item.name}>{index + 1}</span>)}</div>

    {stage === 0 && !won && <section className="runner-question" aria-label="Trädkronorna">
      <p className="runner-prompt">{steps[step]?.prompt}</p>
      <p aria-label={`Frö ${step} av ${steps.length}`}>{'● '.repeat(step).trim() || '·'}</p>
      {steps[step]?.kind === 'question'
        ? <>
            <p className="runner-quiz">{question.prompt}</p>
            <div className="runner-options">{question.options.map(option => <button key={option} onClick={() => answerTutorial(option)}>{option}</button>)}</div>
          </>
        : <div className="runner-controls">
            <button onClick={() => tutorialMove('jump')}>Hoppa</button>
            <button onClick={() => tutorialMove('duck')}>Ducka</button>
            {([0, 1, 2] as Lane[]).map(lane => <button key={lane} onClick={() => tutorialMove('lane')}>Spår {lane + 1}</button>)}
          </div>}
    </section>}

    {stage === 1 && !won && <>
      {banner && <p className="runner-banner" role="status">Fråga: {banner.prompt} - välj rätt spår!</p>}
      <div className="runner-track" aria-label="Djungelbana">
        {([0, 1, 2] as Lane[]).map(lane => <button aria-label={`Spår ${lane + 1}`} aria-pressed={run.lane === lane} className={run.lane === lane ? 'lane active' : 'lane'} key={lane} onClick={() => move(lane)}>
          <span className="runner-player" aria-hidden="true">{run.lane === lane ? '🐒' : ''}</span>
          {run.obstacles.filter(item => visible(item) && (item.kind === 'question' || item.lane === lane)).map(item => <span className={`obstacle ${item.kind}`} key={item.id} style={{ left: `${22 + ((item.distance - run.distance) / VIEW_DISTANCE) * 70}%` }}>{item.kind === 'question' ? item.options?.[lane] : item.kind === 'jump' ? 'HOPPA' : 'DUCKA'}</span>)}
        </button>)}
      </div>
      <div className="runner-controls">
        <button onClick={() => move(undefined, 'jump')}>Hoppa</button>
        <button onClick={() => move(undefined, 'duck')}>Ducka</button>
      </div>
      <progress aria-label="Banans framsteg" max={stageLength(difficulty)} value={run.distance} />
    </>}

    {stage === 2 && !won && <section className="runner-boss" aria-label="Vaktkatten">
      <p className="runner-banner" role="status">{boss.phase === 'telegraph' ? attackHint(boss.attack) : 'Skölden är öppen!'}</p>
      <div className="boss-arena">
        <span className={boss.phase === 'telegraph' && boss.ticksLeft <= 1 ? 'boss-cat strike' : 'boss-cat'} aria-hidden="true">🐆</span>
        <p aria-label={`Träffar ${boss.hits} av ${HITS_TO_WIN}`}>{'★'.repeat(boss.hits)}{'☆'.repeat(HITS_TO_WIN - boss.hits)}</p>
      </div>
      {boss.phase === 'shield'
        ? <div className="runner-options" aria-label="Sköldfråga">
            <p className="runner-quiz">{question.prompt}</p>
            {question.options.map(option => <button key={option} onClick={() => answerShield(option)}>{option}</button>)}
          </div>
        : <div className="runner-controls">
            {([0, 1, 2] as Lane[]).map(lane => <button aria-label={`Spår ${lane + 1}`} aria-pressed={bossLane === lane} key={lane} onClick={() => setBossLane(lane)}>Spår {lane + 1}</button>)}
            <button onClick={() => setBossAction('duck')}>Ducka</button>
          </div>}
    </section>}

    {won && <section className="runner-question" aria-label="Äventyret klart">
      <p>{message}</p>
      <button className="runner-next" onClick={() => restart()}>Spela igen</button>
    </section>}
  </section>
}
