import type { Action, Lane } from './runnerEngine'

export type GuardianAttack = { kind: 'lane'; lane: Lane } | { kind: 'duck' }
export type GuardianPhase = 'telegraph' | 'shield'
export type GuardianState = { hits: number; attack: GuardianAttack; phase: GuardianPhase; ticksLeft: number; window: number }
export type GuardianOutcome = 'ongoing' | 'dodged' | 'hit-player' | 'won'
export type GuardianStep = { state: GuardianState; outcome: GuardianOutcome }

export const TELEGRAPH_TICKS = 3
export const HITS_TO_WIN = 3

export const nextAttack = (random: () => number = Math.random): GuardianAttack =>
  random() < 0.5 ? { kind: 'duck' } : { kind: 'lane', lane: Math.min(2, Math.floor(random() * 3)) as Lane }

export const createGuardian = (random: () => number = Math.random, telegraphTicks: number = TELEGRAPH_TICKS): GuardianState => ({ hits: 0, attack: nextAttack(random), phase: 'telegraph', ticksLeft: telegraphTicks, window: telegraphTicks })

export const dodges = (lane: Lane, action: Action, attack: GuardianAttack): boolean =>
  attack.kind === 'duck' ? action === 'duck' : lane !== attack.lane

export const tickGuardian = (state: GuardianState, lane: Lane, action: Action, random: () => number = Math.random): GuardianStep => {
  if (state.phase === 'shield') return { state, outcome: 'ongoing' }
  if (state.ticksLeft > 1) return { state: { ...state, ticksLeft: state.ticksLeft - 1 }, outcome: 'ongoing' }
  if (dodges(lane, action, state.attack)) return { state: { ...state, phase: 'shield' }, outcome: 'dodged' }
  return { state: { ...state, attack: nextAttack(random), ticksLeft: state.window }, outcome: 'hit-player' }
}

export const landHit = (state: GuardianState, random: () => number = Math.random): GuardianStep => {
  const hits = state.hits + 1
  if (hits >= HITS_TO_WIN) return { state: { ...state, hits }, outcome: 'won' }
  return { state: { hits, attack: nextAttack(random), phase: 'telegraph', ticksLeft: state.window, window: state.window }, outcome: 'ongoing' }
}

export const missShield = (state: GuardianState, random: () => number = Math.random): GuardianState => ({ ...state, attack: nextAttack(random), phase: 'telegraph', ticksLeft: state.window })
