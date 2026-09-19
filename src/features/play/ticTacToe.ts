import { getTrack, type Difficulty, type TrackId } from '../../game'

export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = Cell[]
export type Line = [number, number, number]
export type Question = { prompt: string; options: string[]; correctAnswer: string; pairId: string }

export const WIN_LINES: Line[] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

export const emptyBoard = (): Board => Array(9).fill(null)

export const checkWinner = (board: Board): { mark: Mark; line: Line } | null => {
  for (const line of WIN_LINES) {
    const [a,b,c] = line
    const mark = board[a]
    if (mark && board[b]===mark && board[c]===mark) return { mark, line }
  }
  return null
}

export const isBoardFull = (board: Board): boolean => board.every(cell => cell !== null)

export const makeQuestion = (
  trackId: TrackId,
  difficulty: Difficulty,
  random: () => number = Math.random,
  excludePairIds: string[] = [],
): Question => {
  const pool = getTrack(trackId).pairs[difficulty]
  const alternatives = pool.filter(pair => !excludePairIds.includes(pair.id))
  const candidates = alternatives.length >= 3 ? alternatives : pool
  const [pair, ...rest] = [...candidates].sort(() => random() - .5)
  const distractors = [...rest].sort(() => random() - .5).slice(0, 2).map(item => item.labels[1])
  const options = [pair.labels[1], ...distractors].sort(() => random() - .5)
  return { prompt: pair.labels[0], options, correctAnswer: pair.labels[1], pairId: pair.id }
}
