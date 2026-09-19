export type GatePhase = 'telegraph' | 'question'
export type GateState = { progress: number; blocks: number; phase: GatePhase; ticksLeft: number }
export type GateOutcome = 'ongoing' | 'blocked-hit' | 'missed' | 'won'
export type GateStep = { state: GateState; outcome: GateOutcome }

export const GATE_TELEGRAPH_TICKS = 3
export const BLOCKS_PER_QUESTION = 2
export const PROGRESS_TO_WIN = 3

export const createGate = (): GateState => ({ progress: 0, blocks: 0, phase: 'telegraph', ticksLeft: GATE_TELEGRAPH_TICKS })

export const advanceGate = (state: GateState): GateStep => {
  const progress = state.progress + 1
  if (progress >= PROGRESS_TO_WIN) return { state: { ...state, progress }, outcome: 'won' }
  return { state: { progress, blocks: 0, phase: 'telegraph', ticksLeft: GATE_TELEGRAPH_TICKS }, outcome: 'ongoing' }
}

export const tickGate = (state: GateState, blocking: boolean, fun: boolean): GateStep => {
  if (state.phase === 'question') return { state, outcome: 'ongoing' }
  if (state.ticksLeft > 1) return { state: { ...state, ticksLeft: state.ticksLeft - 1 }, outcome: 'ongoing' }
  if (!blocking) return { state: { ...state, ticksLeft: GATE_TELEGRAPH_TICKS }, outcome: 'missed' }
  const blocks = state.blocks + 1
  if (blocks < BLOCKS_PER_QUESTION) return { state: { ...state, blocks, ticksLeft: GATE_TELEGRAPH_TICKS }, outcome: 'blocked-hit' }
  if (fun) return advanceGate({ ...state, blocks: 0 })
  return { state: { ...state, blocks, phase: 'question' }, outcome: 'blocked-hit' }
}

export const failGate = (state: GateState): GateState => ({ ...state, blocks: 0, phase: 'telegraph', ticksLeft: GATE_TELEGRAPH_TICKS })
