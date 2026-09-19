import { describe, expect, it } from 'vitest'
import { createGuardian, dodges, HITS_TO_WIN, landHit, missShield, TELEGRAPH_TICKS, tickGuardian } from './guardian'

describe('guardian boss', () => {
  it('telegraphs for the full window before resolving', () => {
    const start = createGuardian(() => 0.9)
    let state = start
    for (let i = 0; i < TELEGRAPH_TICKS - 1; i++) {
      const step = tickGuardian(state, 1, 'run')
      expect(step.outcome).toBe('ongoing')
      state = step.state
    }
    expect(state.ticksLeft).toBe(1)
  })
  it('a duck attack is dodged only by ducking', () => {
    expect(dodges(1, 'duck', { kind: 'duck' })).toBe(true)
    expect(dodges(1, 'run', { kind: 'duck' })).toBe(false)
    expect(dodges(1, 'jump', { kind: 'duck' })).toBe(false)
  })
  it('a lane attack is dodged from any other lane', () => {
    expect(dodges(0, 'run', { kind: 'lane', lane: 2 })).toBe(true)
    expect(dodges(2, 'run', { kind: 'lane', lane: 2 })).toBe(false)
  })
  it('opens the shield after a successful dodge', () => {
    const state = { ...createGuardian(() => 0.9), attack: { kind: 'duck' as const }, ticksLeft: 1 }
    const step = tickGuardian(state, 1, 'duck')
    expect(step.outcome).toBe('dodged')
    expect(step.state.phase).toBe('shield')
  })
  it('forgives a failed dodge with a fresh telegraph and keeps hits', () => {
    const state = { ...createGuardian(() => 0.9), hits: 2, attack: { kind: 'lane' as const, lane: 1 as const }, ticksLeft: 1 }
    const step = tickGuardian(state, 1, 'run', () => 0.1)
    expect(step.outcome).toBe('hit-player')
    expect(step.state.hits).toBe(2)
    expect(step.state.phase).toBe('telegraph')
    expect(step.state.ticksLeft).toBe(TELEGRAPH_TICKS)
  })
  it('wins after the third landed hit', () => {
    let state = createGuardian(() => 0.9)
    let outcome = 'ongoing'
    for (let i = 0; i < HITS_TO_WIN; i++) {
      const step = landHit(state, () => 0.9)
      state = step.state
      outcome = step.outcome
    }
    expect(outcome).toBe('won')
    expect(state.hits).toBe(HITS_TO_WIN)
  })
  it('a missed shield answer returns to a fresh telegraph', () => {
    const state = { ...createGuardian(() => 0.9), phase: 'shield' as const, hits: 1 }
    const next = missShield(state, () => 0.9)
    expect(next.phase).toBe('telegraph')
    expect(next.hits).toBe(1)
  })
})

describe('createGuardian telegraph window', () => {
  it('uses a custom telegraph window for gentler levels', () => {
    expect(createGuardian(() => 0.9, 4).ticksLeft).toBe(4)
  })

  it('restores the custom window after a blocked hit', () => {
    const ready = { ...createGuardian(() => 0.9, 4), attack: { kind: 'duck' } as const, phase: 'shield' as const }
    const { state } = landHit(ready, () => 0.1)
    expect(state.ticksLeft).toBe(4)
  })
})
