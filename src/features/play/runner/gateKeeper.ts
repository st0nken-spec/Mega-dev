export type GatePhase = 'telegraph' | 'question'
export type GateState = { progress: number; blocks: number; phase: GatePhase; ticksLeft: number; window: number }
export type GateOutcome = 'ongoing' | 'blocked-hit' | 'missed' | 'won'
export type GateStep = { state: GateState; outcome: GateOutcome }

export const GATE_TELEGRAPH_TICKS = 3
export const BLOCKS_PER_QUESTION = 2
export const PROGRESS_TO_WIN = 3

export const createGate = (telegraphTicks: number = GATE_TELEGRAPH_TICKS): GateState => ({ progress: 0, blocks: 0, phase: 'telegraph', ticksLeft: telegraphTicks, window: telegraphTicks })

export const advanceGate = (state: GateState): GateStep => {
  const progress = state.progress + 1
  if (progress >= PROGRESS_TO_WIN) return { state: { ...state, progress }, outcome: 'won' }
  return { state: { progress, blocks: 0, phase: 'telegraph', ticksLeft: state.window, window: state.window }, outcome: 'ongoing' }
}

export const tickGate = (state: GateState, blocking: boolean, fun: boolean): GateStep => {
  if (state.phase === 'question') return { state, outcome: 'ongoing' }
  if (state.ticksLeft > 1) return { state: { ...state, ticksLeft: state.ticksLeft - 1 }, outcome: 'ongoing' }
  if (!blocking) return { state: { ...state, ticksLeft: state.window }, outcome: 'missed' }
  const blocks = state.blocks + 1
  if (blocks < BLOCKS_PER_QUESTION) return { state: { ...state, blocks, ticksLeft: state.window }, outcome: 'blocked-hit' }
  if (fun) return advanceGate({ ...state, blocks: 0 })
  return { state: { ...state, blocks, phase: 'question' }, outcome: 'blocked-hit' }
}

export const failGate = (state: GateState): GateState => ({ ...state, blocks: 0, phase: 'telegraph', ticksLeft: state.window })
