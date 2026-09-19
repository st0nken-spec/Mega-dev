import { describe, expect, it } from 'vitest'
import { advance, clearsObstacle, createRun, spawnObstacle, SPAWN_EVERY } from './runnerEngine'
import type { Question } from '../ticTacToe'

const question: Question = { prompt: '3', options: ['●', '● ● ●', '● ●'], correctAnswer: '● ● ●', pairId: 'three' }
const questionSource = () => question

describe('runner engine', () => {
  it('spawns deterministic obstacle lanes and kinds', () => {
    expect(spawnObstacle(3, () => 0)).toMatchObject({ lane: 0, kind: 'jump', distance: 7 })
  })
  it('spawns question obstacles with lane options from the question source', () => {
    const obstacle = spawnObstacle(3, () => 0.99, questionSource)
    expect(obstacle).toMatchObject({ kind: 'question', prompt: '3', answer: '● ● ●' })
    expect(obstacle.options).toHaveLength(3)
    expect(obstacle.options).toContain('● ● ●')
  })
  it('never spawns question obstacles without a question source', () => {
    expect(spawnObstacle(3, () => 0.99).kind).not.toBe('question')
  })
  it('maps plain obstacles to forgiving actions', () => {
    expect(clearsObstacle(1, 'jump', { id: 'a', lane: 1, distance: 1, kind: 'jump' })).toBe(true)
    expect(clearsObstacle(1, 'run', { id: 'a', lane: 1, distance: 1, kind: 'duck' })).toBe(false)
  })
  it('clears a question obstacle only in the lane with the right answer', () => {
    const obstacle = { id: 'q', lane: 0 as const, distance: 1, kind: 'question' as const, options: ['●', '● ● ●', '● ●'], answer: '● ● ●' }
    expect(clearsObstacle(1, 'run', obstacle)).toBe(true)
    expect(clearsObstacle(0, 'run', obstacle)).toBe(false)
  })
  it('crashes on the wrong-answer lane wherever the question obstacle sits', () => {
    const obstacle = { id: 'q', lane: 2 as const, distance: 1, kind: 'question' as const, options: ['●', '● ● ●', '● ●'], answer: '● ● ●' }
    expect(advance(createRun([obstacle]), { lane: 0 }, 5).status).toBe('crashed')
    expect(advance(createRun([obstacle]), { lane: 1 }, 5).status).toBe('running')
  })
  it('advances and clears a stage', () => {
    let state = createRun()
    state = advance(state, {}, 1)
    expect(state.status).toBe('clear')
  })
  it('crashes only when obstacle and player share a lane', () => {
    const obstacle = { id: 'a', lane: 1 as const, distance: 1, kind: 'jump' as const }
    expect(advance(createRun([obstacle]), {}, 5).status).toBe('crashed')
    expect(advance(createRun([obstacle]), { lane: 0 }, 5).status).toBe('running')
  })
  it('spawns on the spawn interval', () => {
    let state = createRun()
    for (let i = 0; i < SPAWN_EVERY; i++) state = advance(state, {}, 20, () => 0)
    expect(state.obstacles.length).toBe(1)
  })
})
