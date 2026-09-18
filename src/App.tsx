import { useMemo, useState } from 'react'
import './App.css'

type Profile = { id: string; name: string; level: number; stars: number }
type Card = { id: string; value: number; matched: boolean }
const initialProfiles: Profile[] = [
  { id: 'explorer-1', name: 'Räven', level: 1, stars: 0 },
  { id: 'explorer-2', name: 'Björnen', level: 1, stars: 0 },
]
const loadProfiles = (): Profile[] => {
  try { return JSON.parse(localStorage.getItem('mega-profiles') ?? '') as Profile[] } catch { return initialProfiles }
}
const makeDeck = (): Card[] => [1,2,3,1,2,3].map((value,index)=>({id:`${value}-${index}`,value,matched:false})).sort(()=>Math.random()-.5)

export default function App() {
  const [profiles,setProfiles] = useState(loadProfiles)
  const [activeId,setActiveId] = useState(profiles[0].id)
  const [deck,setDeck] = useState(makeDeck)
  const [open,setOpen] = useState<string[]>([])
  const [message,setMessage] = useState('Hitta två lika tal')
  const active = useMemo(()=>profiles.find(p=>p.id===activeId) ?? profiles[0],[profiles,activeId])
  const choose = (id:string) => {
    if(open.length===2) return
    const card=deck.find(c=>c.id===id); if(!card||card.matched||open.includes(id)) return
    const next=[...open,id]; setOpen(next)
    if(next.length===2){
      const [a,b]=next.map(x=>deck.find(c=>c.id===x))
      if(a?.value===b?.value){
        setDeck(cards=>cards.map(c=>next.includes(c.id)?{...c,matched:true}:c)); setOpen([]); setMessage(`Rätt! ${a?.value} och ${b?.value}`)
        setProfiles(items=>{const updated=items.map(p=>p.id===active.id?{...p,stars:p.stars+1}:p); localStorage.setItem('mega-profiles',JSON.stringify(updated)); return updated})
      } else { setMessage('Nästan! Försök igen'); window.setTimeout(()=>setOpen([]),650) }
    }
  }
  const reset=()=>{setDeck(makeDeck());setOpen([]);setMessage('Hitta två lika tal')}
  return <main>
    <header><div><p className="eyebrow">MEGA-DEV</p><h1>Familjens lärhub</h1></div><span className="private">● Privat hemma</span></header>
    <section className="profiles" aria-label="Välj profil">{profiles.map(p=><button className={p.id===activeId?'profile active':'profile'} onClick={()=>setActiveId(p.id)} key={p.id}><span>{p.id.endsWith('1')?'R':'B'}</span><b>{p.name}</b><small>{p.stars} stjärnor</small></button>)}</section>
    <section className="hero"><div><p className="eyebrow">SPELA & LÄR</p><h2>Talparken</h2><p>{message}</p></div><button className="reset" onClick={reset}>Blanda om</button></section>
    <section className="game" aria-label="Memory med tal">{deck.map(card=>{const shown=card.matched||open.includes(card.id); return <button aria-label={shown?`Tal ${card.value}`:'Dolt kort'} disabled={card.matched} onClick={()=>choose(card.id)} className={shown?'card shown':'card'} key={card.id}>{shown?card.value:'✦'}</button>})}</section>
    <nav><article><span className="nav-icon">S</span><b>Spela</b><small>Första spelet är igång</small></article><article><span className="nav-icon">K</span><b>Skapa</b><small>Kommer i M4</small></article><article><span className="nav-icon">L</span><b>Läxa</b><small>Kommer i M5</small></article></nav>
  </main>
}
