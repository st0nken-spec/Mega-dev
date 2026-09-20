import { useEffect, useState } from 'react'
import { getTrack, tracks, type Difficulty, type TrackId } from '../../../game'
import { DifficultyControl } from '../../../components/DifficultyControl'
import { makeQuestion, type Question } from '../ticTacToe'
import { advance, createRun, TICK_MS, VIEW_DISTANCE, type Lane, type Obstacle, type RunState } from './runnerEngine'
import { advanceGate, BLOCKS_PER_QUESTION, createGate, failGate, PROGRESS_TO_WIN, tickGate, type GateState } from './gateKeeper'
import { courseSteps, gateHint, heroStages } from './heroTrainingContent'
import { TutorialActionButton, TutorialProgressDots } from './runnerTutorialControls'
import './runner.css'

const stageLength = (difficulty: Difficulty) => difficulty === 1 ? 14 : 18
const chaseTick = (difficulty: Difficulty) => difficulty === 1 ? TICK_MS + 60 : TICK_MS - 60
const GATE_TICK_MS = 800
const telegraphTicks = (difficulty: Difficulty) => difficulty === 1 ? 4 : 3
const WIN_MESSAGE = 'Porten är öppen! Du klarade hela hjältebanan.'

export function HeroTraining({ difficulty, onDifficultyChange, onWin }: { difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void; onWin: () => void }) {
  const [trackId, setTrackId] = useState<TrackId>('math')
  const [stage, setStage] = useState(0)
  const [fun, setFun] = useState(false)
  const [step, setStep] = useState(0)
  const [question, setQuestion] = useState<Question>(() => makeQuestion('math', difficulty))
  const [run, setRun] = useState<RunState>(createRun)
  const [gate, setGate] = useState<GateState>(() => createGate(telegraphTicks(difficulty)))
  const [blocking, setBlocking] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState<string>(heroStages[0].description)
  const track = getTrack(trackId)
  const questionSource = fun ? undefined : () => makeQuestion(trackId, difficulty)

  const restart = (nextTrack = trackId, nextDifficulty = difficulty, nextFun = fun) => {
    setTrackId(nextTrack)
    onDifficultyChange(nextDifficulty)
    setFun(nextFun)
    setStage(0)
    setStep(0)
    setQuestion(makeQuestion(nextTrack, nextDifficulty))
    setRun(createRun())
    setGate(createGate(telegraphTicks(nextDifficulty)))
    setBlocking(false)
    setWon(false)
    setMessage(heroStages[0].description)
  }

  const nextStage = () => {
    const next = stage + 1
    if (next > 2) { setWon(true); onWin(); setMessage(WIN_MESSAGE); return }
    setStage(next)
    setStep(0)
    setRun(createRun())
    setGate(createGate(telegraphTicks(difficulty)))
    setBlocking(false)
    setMessage(heroStages[next].description)
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
    if (run.status === 'crashed') { setMessage('Nästan! Löparleden börjar om.'); setRun(createRun()) }
  }, [run.status])

  useEffect(() => {
    if (stage !== 2 || gate.phase !== 'telegraph' || won) return
    const timer = window.setInterval(() => {
      const result = tickGate(gate, blocking, fun)
      setGate(result.state)
      if (result.outcome === 'ongoing') return
      setBlocking(false)
      if (result.outcome === 'missed') { setMessage('Portvakten hann fram! Försök igen.'); return }
      if (result.outcome === 'won') { setWon(true); onWin(); setMessage(WIN_MESSAGE); return }
      if (result.state.phase === 'question') {
        setQuestion(makeQuestion(trackId, difficulty))
        setMessage('Starkt blockerat! Svara rätt för att fylla mätaren.')
      } else {
        setMessage(`Blockerad! ${result.state.blocks} av ${BLOCKS_PER_QUESTION} blockeringar.`)
      }
    }, GATE_TICK_MS)
    return () => clearInterval(timer)
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (won) return
      if (stage === 0) {
        if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); courseMove(courseSteps[step]?.kind === 'duck' ? 'duck' : 'jump') }
      } else if (stage === 1) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(run.lane > 0 ? (run.lane - 1) as Lane : 0) }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(run.lane < 2 ? (run.lane + 1) as Lane : 2) }
        if (event.key === ' ' || event.key === 'ArrowUp') { event.preventDefault(); move(undefined, 'jump') }
        if (event.key === 'ArrowDown') { event.preventDefault(); move(undefined, 'duck') }
      } else if (stage === 2) {
        if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowDown') { event.preventDefault(); setBlocking(true) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const courseMove = (kind: 'jump' | 'duck') => {
    const current = courseSteps[step]
    if (!current || current.kind !== kind) { setMessage(`Prova igen - ${current?.prompt ?? ''}`); return }
    const next = step + 1
    if (next >= courseSteps.length) { nextStage(); return }
    setStep(next)
    setMessage(`Bra! Hinder ${next} av ${courseSteps.length}.`)
  }

  const answerGate = (option: string) => {
    if (option !== question.correctAnswer) { setGate(current => failGate(current)); setMessage('Inte riktigt! Blockera två till för en ny chans.'); return }
    const next = advanceGate(gate)
    setGate(next.state)
    if (next.outcome === 'won') { setWon(true); onWin(); setMessage(WIN_MESSAGE) }
    else setMessage(`Mätaren fylldes! ${next.state.progress} av ${PROGRESS_TO_WIN}.`)
  }

  const move = (lane?: Lane, action?: 'jump' | 'duck') => {
    if (stage !== 1 || run.status !== 'running') return
    setRun(current => advance(current, { lane, action }, stageLength(difficulty), Math.random, questionSource))
  }

  const visible = (item: Obstacle) => item.distance > run.distance && item.distance - run.distance <= VIEW_DISTANCE
  const banner = run.obstacles.filter(item => item.kind === 'question' && visible(item)).sort((a, b) => a.distance - b.distance)[0]

  return <section className="runner-panel" aria-label="Hjältebanan">
    <section className="track-picker" aria-label="Välj ämne">{tracks.map(item => <button aria-pressed={item.id === trackId} className={item.id === trackId ? 'track active' : 'track'} onClick={() => restart(item.id, difficulty)} key={item.id}><span>{item.shortName}</span><b>{item.name}</b></button>)}</section>
    <section className="runner-hero">
      <div>
        <p className="eyebrow">{track.name.toUpperCase()} · NIVÅ {difficulty}</p>
        <h2>Hjältebanan</h2>
        <p aria-live="polite">Bana {stage + 1}: {heroStages[stage]?.name}. {message}</p>
      </div>
      <div className="runner-actions">
        <DifficultyControl value={difficulty} onChange={level => restart(trackId, level)} />
        <button aria-pressed={fun} className="reset" onClick={() => restart(trackId, difficulty, !fun)}>{fun ? 'Lärläge' : 'Bara lek'}</button>
        <button className="reset" onClick={() => restart()}>Börja om</button>
      </div>
    </section>
    <div className="stage-dots" aria-label={`Bana ${stage + 1} av 3`}>{heroStages.map((item, index) => <span className={index === stage ? 'active' : ''} key={item.name}>{index + 1}</span>)}</div>

    {stage === 0 && !won && <section className="runner-question" aria-label="Träningsbanan">
      <p className="runner-prompt">{courseSteps[step]?.prompt}</p>
      <TutorialProgressDots total={courseSteps.length} done={step} label={`Hinder ${step} av ${courseSteps.length}`} />
      <TutorialActionButton kind={courseSteps[step]?.kind === 'duck' ? 'duck' : 'jump'} onMove={courseMove} />
    </section>}

    {stage === 1 && !won && <>
      {banner && <p className="runner-banner" role="status">Fråga: {banner.prompt} - välj rätt spår!</p>}
      <div className="runner-track" aria-label="Löparled">
        {([0, 1, 2] as Lane[]).map(lane => <button aria-label={`Spår ${lane + 1}`} aria-pressed={run.lane === lane} className={run.lane === lane ? 'lane active' : 'lane'} key={lane} onClick={() => move(lane)}>
          <span className="runner-player" aria-hidden="true">{run.lane === lane ? '🏃' : ''}</span>
          {run.obstacles.filter(item => visible(item) && (item.kind === 'question' || item.lane === lane)).map(item => <span className={`obstacle ${item.kind}`} key={item.id} style={{ left: `${22 + ((item.distance - run.distance) / VIEW_DISTANCE) * 70}%` }}>{item.kind === 'question' ? item.options?.[lane] : item.kind === 'jump' ? 'HOPPA' : 'DUCKA'}</span>)}
        </button>)}
      </div>
      <div className="runner-controls">
        <button onClick={() => move(undefined, 'jump')}>Hoppa</button>
        <button onClick={() => move(undefined, 'duck')}>Ducka</button>
      </div>
      <progress aria-label="Banans framsteg" max={stageLength(difficulty)} value={run.distance} />
    </>}

    {stage === 2 && !won && <section className="runner-boss" aria-label="Portvakten">
      <p className="runner-banner" role="status">{gate.phase === 'telegraph' ? gateHint : 'Svara rätt för att fylla mätaren!'}</p>
      <div className="boss-arena">
        <span className={gate.phase === 'telegraph' && gate.ticksLeft <= 1 ? 'boss-cat strike' : 'boss-cat'} aria-hidden="true">🗿</span>
        <p aria-label={`Mätare ${gate.progress} av ${PROGRESS_TO_WIN}`}>{'★'.repeat(gate.progress)}{'☆'.repeat(PROGRESS_TO_WIN - gate.progress)}</p>
      </div>
      {gate.phase === 'question'
        ? <div className="runner-options" aria-label="Styrkefråga">
            <p className="runner-quiz">{question.prompt}</p>
            {question.options.map(option => <button key={option} onClick={() => answerGate(option)}>{option}</button>)}
          </div>
        : <div className="runner-controls">
            <button aria-pressed={blocking} className="block-button" onClick={() => setBlocking(true)}>Blockera</button>
          </div>}
    </section>}

    {won && <section className="runner-question" aria-label="Hjältebanan klar">
      <p>{message}</p>
      <button className="runner-next" onClick={() => restart()}>Spela igen</button>
    </section>}
  </section>
}
