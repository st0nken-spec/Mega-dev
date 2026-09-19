import { useEffect, useRef, useState } from 'react'
import type { Profile } from '../game'

const CONFIRM_MS = 3000

export function ProfileBar({profiles,activeId,onSelect,onReset}:{
  profiles: Profile[]
  activeId: string
  onSelect: (id: string) => void
  onReset: (id: string) => void
}){
  const [confirmingId,setConfirmingId]=useState<string|null>(null)
  const timer=useRef<number|null>(null)

  useEffect(()=>()=>{if(timer.current!==null)window.clearTimeout(timer.current)},[])

  const clearArm=()=>{
    if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null}
    setConfirmingId(null)
  }

  const select=(id:string)=>{clearArm();onSelect(id)}

  const tapReset=(id:string)=>{
    if(confirmingId===id){onReset(id);clearArm();return}
    if(timer.current!==null)window.clearTimeout(timer.current)
    setConfirmingId(id)
    timer.current=window.setTimeout(()=>{setConfirmingId(null);timer.current=null},CONFIRM_MS)
  }

  return <section className="profile-bar" aria-label="Profiler">{profiles.map(p=>{
    const armed=confirmingId===p.id
    return <div className={p.id===activeId?'profile-pill active':'profile-pill'} key={p.id}>
      <button className="profile-select" onClick={()=>select(p.id)} aria-pressed={p.id===activeId}>
        <span>{p.id.endsWith('1')?'R':'B'}</span>
        <b>{p.name} <small>· {p.stars} stjärnor</small></b>
      </button>
      <button
        className={armed?'profile-reset confirm':'profile-reset'}
        data-testid={`profile-reset-${p.id}`}
        onClick={()=>tapReset(p.id)}
        aria-label={armed?`Bekräfta nollställning för ${p.name}`:`Nollställ stjärnor för ${p.name}`}
      >{armed?'Säker?':'↺'}</button>
    </div>
  })}</section>
}
