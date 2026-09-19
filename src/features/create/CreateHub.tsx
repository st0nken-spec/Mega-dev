import { useState } from 'react'
import { ColoringStudio } from './ColoringStudio'
import { DrawingStudio } from './DrawingStudio'
import type { CreateMode } from './createDomain'
import './create.css'
const modes:{id:CreateMode;icon:string;name:string;help:string}[]=[{id:'color',icon:'F',name:'Färglägg',help:'Tryck och fyll med färg'},{id:'draw',icon:'R',name:'Rita fritt',help:'Skapa precis vad du vill'},{id:'trace',icon:'S',name:'Spåra',help:'Följ former, bokstäver och siffror'}]
export function CreateHub(){const[mode,setMode]=useState<CreateMode>('color');return <section className="create-hub"><div className="create-hero"><p className="eyebrow">SKAPA</p><h2>Vad vill du skapa?</h2><p>Välj en aktivitet och sätt igång.</p></div><div className="create-modes">{modes.map(item=><button key={item.id} className={mode===item.id?'create-mode active':'create-mode'} onClick={()=>setMode(item.id)} aria-pressed={mode===item.id}><span>{item.icon}</span><b>{item.name}</b><small>{item.help}</small></button>)}</div>{mode==='color'?<ColoringStudio/>:<DrawingStudio trace={mode==='trace'}/>}</section>}
