import { useState } from 'react'
import { getTrack, tracks, type Difficulty, type TrackId } from '../../game'
import { DifficultyControl } from '../../components/DifficultyControl'
import { checkWinner, emptyBoard, isBoardFull, makeQuestion, type Board, type Line, type Mark, type Question } from './ticTacToe'

type Pending = { cellIndex: number; question: Question }
type Status = 'playing' | 'won' | 'draw'

export function TicTacToe({difficulty,onDifficultyChange,onWin}:{difficulty:Difficulty;onDifficultyChange:(value:Difficulty)=>void;onWin:()=>void}){
  const [trackId,setTrackId]=useState<TrackId>('math')
  const [board,setBoard]=useState<Board>(()=>emptyBoard())
  const [activePlayer,setActivePlayer]=useState<Mark>('X')
  const [askedPairIds,setAskedPairIds]=useState<string[]>([])
  const [pending,setPending]=useState<Pending|null>(null)
  const [status,setStatus]=useState<Status>('playing')
  const [winningLine,setWinningLine]=useState<Line|null>(null)
  const track=getTrack(trackId)
  const [message,setMessage]=useState(track.instruction)

  const start=(nextTrack:TrackId=trackId,nextDifficulty:Difficulty=difficulty)=>{
    setTrackId(nextTrack);onDifficultyChange(nextDifficulty);setBoard(emptyBoard());setActivePlayer('X');setAskedPairIds([]);setPending(null);setStatus('playing');setWinningLine(null);setMessage(getTrack(nextTrack).instruction)
  }

  const chooseCell=(index:number)=>{
    if(pending||status!=='playing'||board[index])return
    setPending({cellIndex:index,question:makeQuestion(trackId,difficulty,Math.random,askedPairIds)})
  }

  const answer=(option:string)=>{
    if(!pending)return
    const {cellIndex,question}=pending
    const correct=option===question.correctAnswer
    setAskedPairIds(items=>[...items,question.pairId])
    setPending(null)
    const nextBoard=correct?board.map((cell,i)=>i===cellIndex?activePlayer:cell):board
    if(correct)setBoard(nextBoard)
    const win=checkWinner(nextBoard)
    if(win){setStatus('won');setWinningLine(win.line);setMessage(`${win.mark} vann tre i rad!`);onWin();return}
    if(isBoardFull(nextBoard)){setStatus('draw');setMessage('Oavgjort!');return}
    const next=activePlayer==='X'?'O':'X'
    setActivePlayer(next)
    setMessage(correct?`Spelare ${next}, din tur`:`Fel svar! Spelare ${next}, din tur`)
  }

  return <>
    <section className="track-picker" aria-label="Välj ämne">{tracks.map(item=><button aria-pressed={item.id===trackId} className={item.id===trackId?'track active':'track'} onClick={()=>start(item.id,difficulty)} key={item.id}><span>{item.shortName}</span><b>{item.name}</b></button>)}</section>
    <section className="hero"><div><p className="eyebrow">{track.name.toUpperCase()} · NIVÅ {difficulty}</p><h2>Tre i rad</h2><p aria-live="polite">{message}</p></div><div className="actions"><DifficultyControl value={difficulty} onChange={level=>start(trackId,level)}/><button className="reset" onClick={()=>start()}>Blanda om</button></div></section>
    {pending&&<section className="question" aria-label="Fråga"><p>{pending.question.prompt}</p><div className="answers">{pending.question.options.map((option,i)=><button data-testid={`answer-${i}`} className="answer" onClick={()=>answer(option)} key={`option-${i}`}>{option}</button>)}</div></section>}
    <section className="game" aria-label="Tre i rad">{board.map((cell,i)=><button data-testid={`cell-${i}`} aria-label={cell?`Ruta ${i+1}: ${cell}`:`Ruta ${i+1}, tom`} disabled={cell!==null||pending!==null||status!=='playing'} onClick={()=>chooseCell(i)} className={winningLine?.includes(i)?'card shown winning':'card shown'} key={i}>{cell??''}</button>)}</section>
  </>
}
