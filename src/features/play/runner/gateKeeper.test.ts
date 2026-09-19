import { describe, expect, it } from 'vitest'
import { advanceGate, BLOCKS_PER_QUESTION, createGate, failGate, GATE_TELEGRAPH_TICKS, PROGRESS_TO_WIN, tickGate } from './gateKeeper'

describe('gate keeper boss', () => {
  it('telegraphs for the full window before resolving', () => {
    let state = createGate()
    for (let i = 0; i < GATE_TELEGRAPH_TICKS - 1; i++) {
      const step = tickGate(state, false, false)
      expect(step.outcome).toBe('ongoing')
      state = step.state
    }
    expect(state.ticksLeft).toBe(1)
  })
  it('forgives a missed block with a fresh telegraph and keeps progress', () => {
    const state = { ...createGate(), progress: 2, ticksLeft: 1 }
    const step = tickGate(state, false, false)
    expect(step.outcome).toBe('missed')
    expect(step.state.progress).toBe(2)
    expect(step.state.ticksLeft).toBe(GATE_TELEGRAPH_TICKS)
  })
  it('counts successful blocks and pauses for a question in learning mode', () => {
    let state = createGate()
    for (let i = 0; i < BLOCKS_PER_QUESTION; i++) {
      const ready = { ...state, ticksLeft: 1 }
      const step = tickGate(ready, true, false)
      expect(step.outcome).toBe('blocked-hit')
      state = step.state
    }
    expect(state.phase).toBe('question')
    expect(tickGate(state, true, false).outcome).toBe('ongoing')
  })
  it('advances the meter directly in pure-fun mode', () => {
    let state = createGate()
    for (let i = 0; i < BLOCKS_PER_QUESTION; i++) state = tickGate({ ...state, ticksLeft: 1 }, true, true).state
    expect(state.progress).toBe(1)
    expect(state.blocks).toBe(0)
    expect(state.phase).toBe('telegraph')
  })
  it('a wrong answer resets the block streak but keeps the meter', () => {
    const state = { ...createGate(), progress: 1, blocks: 2, phase: 'question' as const }
    const next = failGate(state)
    expect(next.phase).toBe('telegraph')
    expect(next.blocks).toBe(0)
    expect(next.progress).toBe(1)
  })
  it('wins when the meter fills', () => {
    let state = createGate()
    let outcome = 'ongoing'
    for (let i = 0; i < PROGRESS_TO_WIN; i++) {
      const step = advanceGate(state)
      state = step.state
      outcome = step.outcome
    }
    expect(outcome).toBe('won')
    expect(state.progress).toBe(PROGRESS_TO_WIN)
  })
})

describe('createGate telegraph window', () => {
  it('uses a custom telegraph window for gentler levels', () => {
    expect(createGate(4).ticksLeft).toBe(4)
  })

  it('restores the custom window after a miss', () => {
    const ready = { ...createGate(4), ticksLeft: 1 }
    const { state, outcome } = tickGate(ready, false, true)
    expect(outcome).toBe('missed')
    expect(state.ticksLeft).toBe(4)
  })
})
