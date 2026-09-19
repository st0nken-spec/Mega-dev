import { useState } from 'react'
import './App.css'
import { awardStar, loadProfiles, type Profile } from './game'
import { HubNav, type Hub } from './components/HubNav'
import { ProfilePicker } from './components/ProfilePicker'
import { CreateHub } from './features/create/CreateHub'
import { MatchingGame } from './features/matching/MatchingGame'
export default function App(){
  const [profiles,setProfiles]=useState<Profile[]>(()=>loadProfiles(localStorage.getItem('mega-profiles')))
  const [activeId,setActiveId]=useState(profiles[0].id)
  const [hub,setHub]=useState<Hub>('play')
  const award=()=>setProfiles(items=>{const updated=awardStar(items,activeId);localStorage.setItem('mega-profiles',JSON.stringify(updated));return updated})
  return <main><header><div><p className="eyebrow">MEGA-DEV</p><h1>Familjens lärhub</h1></div><span className="private">● Privat hemma</span></header><ProfilePicker profiles={profiles} activeId={activeId} onSelect={setActiveId}/>{hub==='play'?<MatchingGame onMatch={award}/>:<CreateHub/>}<HubNav active={hub} onSelect={setHub}/></main>
}
