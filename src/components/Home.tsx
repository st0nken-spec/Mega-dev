import type { Hub } from '../App'

const cards:{hub:Hub;icon:string;name:string;description:string}[]=[
  {hub:'play',icon:'S',name:'Spela',description:'Parjakten, Tre i rad, Siffersnok'},
  {hub:'create',icon:'K',name:'Skapa',description:'Färglägg, rita och spåra'},
  {hub:'homework',icon:'L',name:'Läxa',description:'Öva matte och svenska inför skolan'},
]

export function Home({onSelect}:{onSelect:(hub:Hub)=>void}){
  return <section className="home-cards" aria-label="Vad vill du göra?">{cards.map(card=>
    <button className={`home-card ${card.hub}`} onClick={()=>onSelect(card.hub)} key={card.hub}>
      <span className="home-card-icon">{card.icon}</span>
      <div><b>{card.name}</b><small>{card.description}</small></div>
      <span className="home-card-chevron">›</span>
    </button>
  )}</section>
}
