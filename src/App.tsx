import { useState } from 'react'
import './App.css'
import { awardStar, getTrack, loadProfiles, makeDeck, matchCards, tracks, type Difficulty, type Profile, type TrackId } from './game'

export default function App(){
  const [profiles,setProfiles]=useState<Profile[]>(()=>loadProfiles(localStorage.getItem('mega-profiles')))
  const [activeId,setActiveId]=useState(profiles[0].id)
  const [trackId,setTrackId]=useState<TrackId>('math')
  const [difficulty,setDifficulty]=useState<Difficulty>(1)
  const [deck,setDeck]=useState(()=>makeDeck())
  const [open,setOpen]=useState<string[]>([])
  const track=getTrack(trackId)
  const [message,setMessage]=useState(track.instruction)
  const start=(nextTrack:TrackId=trackId,nextDifficulty:Difficulty=difficulty)=>{const next=getTrack(nextTrack);const samePack=nextTrack===trackId&&nextDifficulty===difficulty;const currentPairs=samePack?[...new Set(deck.map(card=>card.pairId))]:[];setTrackId(nextTrack);setDifficulty(nextDifficulty);setDeck(makeDeck(nextTrack,nextDifficulty,Math.random,currentPairs));setOpen([]);setMessage(next.instruction)}
  const choose=(id:string)=>{
    if(open.length===2)return
    const card=deck.find(c=>c.id===id);if(!card||card.matched||open.includes(id))return
    const next=[...open,id];setOpen(next)
    if(next.length===2){const result=matchCards(deck,next)
      if(result.matched){setDeck(result.deck);setOpen([]);setMessage('Rätt! Bra jobbat!');setProfiles(items=>{const updated=awardStar(items,activeId);localStorage.setItem('mega-profiles',JSON.stringify(updated));return updated})}
      else{setMessage('Nästan! Försök igen');window.setTimeout(()=>setOpen([]),650)}
    }
  }
  return <main>
    <header><div><p className="eyebrow">MEGA-DEV</p><h1>Familjens lärhub</h1></div><span className="private">● Privat hemma</span></header>
    <section className="profiles" aria-label="Välj profil">{profiles.map(p=><button className={p.id===activeId?'profile active':'profile'} onClick={()=>setActiveId(p.id)} key={p.id}><span>{p.id.endsWith('1')?'R':'B'}</span><b>{p.name}</b><small>{p.stars} stjärnor</small></button>)}</section>
    <section className="track-picker" aria-label="Välj ämne">{tracks.map(item=><button className={item.id===trackId?'track active':'track'} onClick={()=>start(item.id,difficulty)} key={item.id}><span>{item.shortName}</span><b>{item.name}</b></button>)}</section>
    <section className="hero"><div><p className="eyebrow">{track.name.toUpperCase()} · NIVÅ {difficulty}</p><h2>Parjakten</h2><p aria-live="polite">{message}</p></div><div className="actions"><button className="level" onClick={()=>start(trackId,difficulty===1?2:1)}>Nivå {difficulty===1?2:1}</button><button className="reset" onClick={()=>start()}>Blanda om</button></div></section>
    <section className="game" aria-label={`Memory: ${track.name}`}>{deck.map(card=>{const shown=card.matched||open.includes(card.id);return <button data-testid={card.id} aria-label={shown?card.label:'Dolt kort'} disabled={card.matched} onClick={()=>choose(card.id)} className={shown?'card shown':'card'} key={card.id}>{shown?<span>{card.label}</span>:'✦'}</button>})}</section>
    <nav><article><span className="nav-icon">S</span><b>Spela</b><small>Fyra ämnen är igång</small></article><article><span className="nav-icon">K</span><b>Skapa</b><small>Kommer senare</small></article><article><span className="nav-icon">L</span><b>Läxa</b><small>Kommer senare</small></article></nav>
  </main>
}
