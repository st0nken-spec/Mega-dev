import { useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'
import './features/create/create.css'
import { awardStar, loadProfiles, resetStars, type Profile } from './game'
import { ProfileBar } from './components/ProfileBar'
import { Home } from './components/Home'
import { HubPicker, type HubPickerItem } from './components/HubPicker'
import { ActivityFrame } from './components/ActivityFrame'
import { ColoringStudio } from './features/create/ColoringStudio'
import { DrawingStudio } from './features/create/DrawingStudio'
import { MatchingGame } from './features/matching/MatchingGame'
import { TicTacToe } from './features/play/TicTacToe'
import { SnakeGame } from './features/play/SnakeGame'

export type Hub = 'play' | 'create' | 'homework'
type PlayActivity = 'matching' | 'tictactoe' | 'snake'
type CreateActivity = 'color' | 'draw' | 'trace'
type Screen =
  | { kind: 'home' }
  | { kind: 'hub'; hub: Hub }
  | { kind: 'activity'; hub: 'play'; activity: PlayActivity }
  | { kind: 'activity'; hub: 'create'; activity: CreateActivity }

const playItems: HubPickerItem[] = [
  { id: 'matching', icon: 'P', name: 'Parjakten', description: 'Matcha par i fyra ämnen' },
  { id: 'tictactoe', icon: 'T', name: 'Tre i rad', description: 'Svara rätt för att ta en ruta' },
  { id: 'snake', icon: 'S', name: 'Siffersnok', description: 'Ät rätt siffra med ormen' },
]
const createItems: HubPickerItem[] = [
  { id: 'color', icon: 'F', name: 'Färglägg', description: 'Tryck och fyll med färg' },
  { id: 'draw', icon: 'R', name: 'Rita fritt', description: 'Skapa precis vad du vill' },
  { id: 'trace', icon: 'S', name: 'Spåra', description: 'Följ former, bokstäver och siffror' },
]
const playNames: Record<PlayActivity,string> = { matching:'Parjakten', tictactoe:'Tre i rad', snake:'Siffersnok' }
const createNames: Record<CreateActivity,string> = { color:'Färglägg', draw:'Rita fritt', trace:'Spåra' }

export default function App(){
  const [profiles,setProfiles]=useState<Profile[]>(()=>loadProfiles(localStorage.getItem('mega-profiles')))
  const [activeId,setActiveId]=useState(profiles[0].id)
  const [screen,setScreen]=useState<Screen>({kind:'home'})

  const persist=(updated:Profile[])=>{setProfiles(updated);localStorage.setItem('mega-profiles',JSON.stringify(updated))}
  const award=()=>persist(awardStar(profiles,activeId))
  const reset=(id:string)=>persist(resetStars(profiles,id))

  const goHome=()=>setScreen({kind:'home'})
  const goHub=(hub:Hub)=>setScreen({kind:'hub',hub})

  let content:ReactNode
  if(screen.kind==='home'){
    content=<Home onSelect={goHub}/>
  } else if(screen.kind==='hub'){
    if(screen.hub==='play'){
      content=<HubPicker title="Välj ett spel" subtitle="SPELA" items={playItems} onBack={goHome} onSelect={id=>setScreen({kind:'activity',hub:'play',activity:id as PlayActivity})}/>
    } else if(screen.hub==='create'){
      content=<HubPicker title="Vad vill du skapa?" subtitle="SKAPA" items={createItems} onBack={goHome} onSelect={id=>setScreen({kind:'activity',hub:'create',activity:id as CreateActivity})}/>
    } else {
      content=<Home onSelect={goHub}/>
    }
  } else if(screen.hub==='play'){
    const game=screen.activity==='matching'?<MatchingGame onMatch={award}/>:screen.activity==='tictactoe'?<TicTacToe onWin={award}/>:<SnakeGame/>
    content=<ActivityFrame backLabel="Spela" breadcrumb={playNames[screen.activity]} onBack={()=>goHub('play')}>{game}</ActivityFrame>
  } else {
    const studio=screen.activity==='color'?<ColoringStudio/>:<DrawingStudio trace={screen.activity==='trace'}/>
    content=<ActivityFrame backLabel="Skapa" breadcrumb={createNames[screen.activity]} onBack={()=>goHub('create')}>{studio}</ActivityFrame>
  }

  return <main>
    <header><div><p className="eyebrow">MEGA-DEV</p><h1>Familjens lärhub</h1></div><span className="private">● Privat hemma</span></header>
    <ProfileBar profiles={profiles} activeId={activeId} onSelect={setActiveId} onReset={reset}/>
    {content}
  </main>
}
