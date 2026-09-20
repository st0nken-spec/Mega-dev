import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'
import './features/create/create.css'
import { awardStar, loadProfiles, resetStars, type Difficulty, type Profile } from './game'
import { ProfileBar } from './components/ProfileBar'
import { Home } from './components/Home'
import { HubPicker, type HubPickerItem } from './components/HubPicker'
import { ActivityFrame } from './components/ActivityFrame'
import { ColoringStudio } from './features/create/ColoringStudio'
import { DrawingStudio } from './features/create/DrawingStudio'
import { MatchingGame } from './features/matching/MatchingGame'
import { TicTacToe } from './features/play/TicTacToe'
import { SnakeGame } from './features/play/SnakeGame'
import { HomeworkHub } from './features/homework/HomeworkHub'
import { JungleRun } from './features/play/runner/JungleRun'
import { HeroTraining } from './features/play/runner/HeroTraining'
import { appBuildId } from './buildInfo'

export type Hub = 'play' | 'create' | 'homework'
type PlayActivity = 'matching' | 'tictactoe' | 'snake' | 'jungleRun' | 'heroTraining'
type CreateActivity = 'color' | 'draw' | 'trace'
type Screen =
  | { kind: 'home' }
  | { kind: 'hub'; hub: Hub }
  | { kind: 'activity'; hub: 'play'; activity: PlayActivity }
  | { kind: 'activity'; hub: 'create'; activity: CreateActivity }
  | { kind: 'activity'; hub: 'homework' }

const playItems: HubPickerItem[] = [
  { id: 'matching', icon: 'P', name: 'Parjakten', description: 'Matcha par i fyra ämnen' },
  { id: 'tictactoe', icon: 'T', name: 'Tre i rad', description: 'Svara rätt för att ta en ruta' },
  { id: 'snake', icon: 'S', name: 'Siffersnok', description: 'Ät rätt siffra med ormen' },
  { id: 'jungleRun', icon: 'D', name: 'Djungellöpet', description: 'Tre banor med hopp, flykt och vaktkatt' },
  { id: 'heroTraining', icon: 'H', name: 'Hjältebanan', description: 'Träna, spring och blockera portvakten' },
]
const createItems: HubPickerItem[] = [
  { id: 'color', icon: 'F', name: 'Färglägg', description: 'Tryck och fyll med färg' },
  { id: 'draw', icon: 'R', name: 'Rita fritt', description: 'Skapa precis vad du vill' },
  { id: 'trace', icon: 'S', name: 'Spåra', description: 'Följ former, bokstäver och siffror' },
]
const playNames: Record<PlayActivity,string> = { matching:'Parjakten', tictactoe:'Tre i rad', snake:'Siffersnok', jungleRun:'Djungellöpet', heroTraining:'Hjältebanan' }
const createNames: Record<CreateActivity,string> = { color:'Färglägg', draw:'Rita fritt', trace:'Spåra' }

const parseScreen=(pathname:string):Screen=>{
  const [hub,activity]=pathname.split('/').filter(Boolean)
  if(hub==='play'){
    if(activity&&playItems.some(item=>item.id===activity))return {kind:'activity',hub:'play',activity:activity as PlayActivity}
    return {kind:'hub',hub:'play'}
  }
  if(hub==='create'){
    if(activity&&createItems.some(item=>item.id===activity))return {kind:'activity',hub:'create',activity:activity as CreateActivity}
    return {kind:'hub',hub:'create'}
  }
  if(hub==='homework')return {kind:'activity',hub:'homework'}
  return {kind:'home'}
}

const screenPath=(screen:Screen):string=>{
  if(screen.kind==='home')return '/'
  if(screen.kind==='hub')return `/${screen.hub}`
  if(screen.hub==='homework')return '/homework'
  return `/${screen.hub}/${screen.activity}`
}

// Rebuilds the ancestor chain (Home -> Hub -> Activity) as separate history
// entries, so a direct deep-link load has somewhere real for history.back()
// to land on, matching the entries organic in-app navigation would produce.
const ancestorPaths=(screen:Screen):string[]=>{
  if(screen.kind==='home')return ['/']
  if(screen.kind==='hub')return ['/', `/${screen.hub}`]
  if(screen.hub==='homework')return ['/', '/homework']
  return ['/', `/${screen.hub}`, `/${screen.hub}/${screen.activity}`]
}

export default function App(){
  const [profiles,setProfiles]=useState<Profile[]>(()=>loadProfiles(localStorage.getItem('mega-profiles')))
  const [activeId,setActiveId]=useState(profiles[0].id)
  const [screen,setScreen]=useState<Screen>(()=>parseScreen(window.location.pathname))
  const [difficulty,setDifficulty]=useState<Difficulty>(1)

  useEffect(()=>{
    const initial=parseScreen(window.location.pathname)
    const paths=ancestorPaths(initial)
    window.history.replaceState(null,'',paths[0])
    for(let i=1;i<paths.length;i++)window.history.pushState(null,'',paths[i])
  },[])

  useEffect(()=>{
    const onPopState=()=>setScreen(parseScreen(window.location.pathname))
    window.addEventListener('popstate',onPopState)
    return ()=>window.removeEventListener('popstate',onPopState)
  },[])

  // Keeps the address bar in sync with whatever actually rendered, including
  // when parseScreen fell back for a stale/invalid deep link.
  useEffect(()=>{
    const path=screenPath(screen)
    if(window.location.pathname!==path)window.history.replaceState(null,'',path)
  },[screen])

  const navigate=(next:Screen)=>{
    const path=screenPath(next)
    if(window.location.pathname!==path)window.history.pushState(null,'',path)
    setScreen(next)
  }
  const back=()=>window.history.back()

  const persist=(updated:Profile[])=>{setProfiles(updated);localStorage.setItem('mega-profiles',JSON.stringify(updated))}
  const award=()=>persist(awardStar(profiles,activeId))
  const reset=(id:string)=>persist(resetStars(profiles,id))

  const goHub=(hub:Hub)=>hub==='homework'?navigate({kind:'activity',hub:'homework'}):navigate({kind:'hub',hub})

  let content:ReactNode
  if(screen.kind==='home'){
    content=<Home onSelect={goHub}/>
  } else if(screen.kind==='hub'){
    if(screen.hub==='play'){
      content=<HubPicker title="Välj ett spel" subtitle="SPELA" items={playItems} onBack={back} onSelect={id=>navigate({kind:'activity',hub:'play',activity:id as PlayActivity})}/>
    } else if(screen.hub==='create'){
      content=<HubPicker title="Vad vill du skapa?" subtitle="SKAPA" items={createItems} onBack={back} onSelect={id=>navigate({kind:'activity',hub:'create',activity:id as CreateActivity})}/>
    } else {
      content=<Home onSelect={goHub}/>
    }
  } else if(screen.hub==='play'){
    const game=screen.activity==='matching'?<MatchingGame difficulty={difficulty} onDifficultyChange={setDifficulty} onMatch={award}/>:screen.activity==='tictactoe'?<TicTacToe difficulty={difficulty} onDifficultyChange={setDifficulty} onWin={award}/>:screen.activity==='snake'?<SnakeGame key={difficulty} difficulty={difficulty} onDifficultyChange={setDifficulty}/>:screen.activity==='jungleRun'?<JungleRun difficulty={difficulty} onDifficultyChange={setDifficulty} onWin={award}/>:<HeroTraining difficulty={difficulty} onDifficultyChange={setDifficulty} onWin={award}/>
    content=<ActivityFrame backLabel="Spela" breadcrumb={playNames[screen.activity]} onBack={back}>{game}</ActivityFrame>
  } else if(screen.hub==='create'){
    const studio=screen.activity==='color'?<ColoringStudio/>:<DrawingStudio trace={screen.activity==='trace'}/>
    content=<ActivityFrame backLabel="Skapa" breadcrumb={createNames[screen.activity]} onBack={back}>{studio}</ActivityFrame>
  } else {
    content=<ActivityFrame backLabel="Hem" breadcrumb="Läxa" onBack={back}><HomeworkHub/></ActivityFrame>
  }

  return <><a className="skip-link" href="#main-content">Hoppa till innehållet</a><main id="main-content" tabIndex={-1}>
    <header><div><p className="eyebrow">MEGA-DEV</p><h1>Familjens lärhub</h1></div><div className="header-status"><span className="private">● Privat hemma</span><span className="build-stamp" aria-label={`Version ${appBuildId}`}>v {appBuildId}</span></div></header>
    <ProfileBar profiles={profiles} activeId={activeId} onSelect={setActiveId} onReset={reset}/>
    {content}
  </main></>
}
