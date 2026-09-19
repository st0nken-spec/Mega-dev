import { describe,expect,it } from 'vitest'
import { checkWinner,emptyBoard,isBoardFull,makeQuestion,WIN_LINES,type Board } from './ticTacToe'
describe('tic-tac-toe domain',()=>{
  it('starts with nine empty cells',()=>{expect(emptyBoard()).toEqual(Array(9).fill(null))})
  it('detects a winner on every line',()=>{
    for(const [a,b,c] of WIN_LINES){
      const board:Board=emptyBoard();board[a]='X';board[b]='X';board[c]='X'
      expect(checkWinner(board)).toEqual({mark:'X',line:[a,b,c]})
    }
  })
  it('finds no winner on an empty or mixed board',()=>{
    expect(checkWinner(emptyBoard())).toBeNull()
    const board:Board=['X','O','X','X','O','O','O','X','X']
    expect(checkWinner(board)).toBeNull()
  })
  it('treats a full board as full and an empty board as not full',()=>{
    const full:Board=['X','O','X','X','O','O','O','X','X']
    expect(isBoardFull(full)).toBe(true)
    expect(isBoardFull(emptyBoard())).toBe(false)
  })
  it('builds a question with the correct answer among three distinct options',()=>{
    const question=makeQuestion('math',1,()=>.5)
    expect(question.options).toHaveLength(3)
    expect(question.options).toContain(question.correctAnswer)
    expect(new Set(question.options).size).toBe(3)
  })
  it('falls back to the full pack once fewer than three unasked pairs remain',()=>{
    const mathIds=['one','two','three','four','five','six']
    const question=makeQuestion('math',1,()=>.5,mathIds.slice(0,4))
    expect(mathIds).toContain(question.pairId)
  })
})
