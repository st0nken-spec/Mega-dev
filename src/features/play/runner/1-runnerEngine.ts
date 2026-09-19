import type { Question } from '../ticTacToe'

export type Lane = 0 | 1 | 2
export type Action = 'run' | 'jump' | 'duck'
export type ObstacleKind = 'jump' | 'duck' | 'question'
export type Obstacle = { id: string; lane: Lane; distance: number; kind: ObstacleKind; prompt?: string; options?: string[]; answer?: string }
export type RunState = { lane: Lane; action: Action; distance: number; obstacles: Obstacle[]; tokens: number; status: 'running' | 'crashed' | 'clear' }

export const TICK_MS = 300
export const LANE_COUNT = 3
export const SPAWN_EVERY = 3
export const VIEW_DISTANCE = 5

export const createRun = (obstacles: Obstacle[] = []): RunState => ({ lane: 1, action: 'run', distance: 0, obstacles, tokens: 0, status: 'running' })

export const spawnObstacle = (distance: number, random: () => number = Math.random, questionSource?: () => Question): Obstacle => {
  const kinds: ObstacleKind[] = questionSource ? ['jump', 'duck', 'question'] : ['jump', 'duck']
  const kind = kinds[Math.min(kinds.length - 1, Math.floor(random() * kinds.length))]
  const lane = Math.min(LANE_COUNT - 1, Math.floor(random() * LANE_COUNT)) as Lane
  if (kind === 'question' && questionSource) {
    const question = questionSource()
    const options = [...question.options]
    while (options.length < LANE_COUNT) options.push(question.correctAnswer)
    return { id: `obstacle-${distance}`, lane, distance: distance + 4, kind, prompt: question.prompt, options: options.slice(0, LANE_COUNT), answer: question.correctAnswer }
  }
  return { id: `obstacle-${distance}`, lane, distance: distance + 4, kind }
}

export const clearsObstacle = (lane: Lane, action: Action, obstacle: Obstacle): boolean => {
  if (obstacle.kind === 'jump') return action === 'jump'
  if (obstacle.kind === 'duck') return action === 'duck'
  return obstacle.options ? obstacle.options[lane] === obstacle.answer : true
}

export const advance = (state: RunState, input: { lane?: Lane; action?: Action }, stageLength: number, random: () => number = Math.random, questionSource?: () => Question): RunState => {
  if (state.status !== 'running') return state
  const lane = input.lane ?? state.lane
  const action = input.action ?? 'run'
  const distance = state.distance + 1
  const due = state.obstacles.filter(item => item.distance === distance)
  const crashed = due.some(item => item.kind === 'question'
    ? !clearsObstacle(lane, action, item)
    : item.lane === lane && !clearsObstacle(lane, action, item))
  let obstacles = state.obstacles.filter(item => item.distance > distance)
  if (distance < stageLength && distance % SPAWN_EVERY === 0) obstacles = [...obstacles, spawnObstacle(distance, random, questionSource)]
  return { ...state, lane, action, distance, obstacles, status: crashed ? 'crashed' : distance >= stageLength ? 'clear' : 'running' }
}
