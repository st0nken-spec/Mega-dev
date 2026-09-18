export type TrackId = 'math' | 'swedish' | 'english' | 'knowledge'
export type Difficulty = 1 | 2
export type Card = { id: string; pairId: string; label: string; matched: boolean }
export type Profile = { id: string; name: string; level: number; stars: number }
export type LearningPair = { id: string; labels: [string, string] }
export type LearningTrack = { id: TrackId; name: string; shortName: string; instruction: string; pairs: Record<Difficulty, LearningPair[]> }

export const tracks: LearningTrack[] = [
  { id:'math', name:'Matte', shortName:'123', instruction:'Hitta talet och lika många prickar', pairs:{
    1:[{id:'one',labels:['1','●']},{id:'two',labels:['2','● ●']},{id:'three',labels:['3','● ● ●']}],
    2:[{id:'four',labels:['4','● ●\n● ●']},{id:'five',labels:['5','● ● ●\n● ●']},{id:'six',labels:['6','● ● ●\n● ● ●']}],
  }},
  { id:'swedish', name:'Svenska', shortName:'ÅÄÖ', instruction:'Hitta stor och liten bokstav', pairs:{
    1:[{id:'a',labels:['A','a']},{id:'m',labels:['M','m']},{id:'s',labels:['S','s']}],
    2:[{id:'b',labels:['B','b']},{id:'r',labels:['R','r']},{id:'k',labels:['K','k']}],
  }},
  { id:'english', name:'Engelska', shortName:'ABC', instruction:'Matcha engelska ord med bildord', pairs:{
    1:[{id:'cat',labels:['CAT','KATT']},{id:'sun',labels:['SUN','SOL']},{id:'car',labels:['CAR','BIL']}],
    2:[{id:'dog',labels:['DOG','HUND']},{id:'red',labels:['RED','RÖD']},{id:'book',labels:['BOOK','BOK']}],
  }},
  { id:'knowledge', name:'Kul fakta', shortName:'?', instruction:'Hitta det som hör ihop', pairs:{
    1:[{id:'cow',labels:['KO','MU']},{id:'bee',labels:['BI','HONUNG']},{id:'fish',labels:['FISK','VATTEN']}],
    2:[{id:'winter',labels:['VINTER','SNÖ']},{id:'night',labels:['NATT','MÅNE']},{id:'tree',labels:['TRÄD','LÖV']}],
  }},
]

export const initialProfiles: Profile[] = [
  { id:'explorer-1', name:'Räven', level:1, stars:0 },
  { id:'explorer-2', name:'Björnen', level:1, stars:0 },
]
export const getTrack = (id: TrackId) => tracks.find(track=>track.id===id) ?? tracks[0]
export const makeDeck = (trackId: TrackId='math', difficulty: Difficulty=1, random:()=>number=Math.random): Card[] =>
  getTrack(trackId).pairs[difficulty].flatMap(pair=>pair.labels.map((label,index)=>({id:`${pair.id}-${index}`,pairId:pair.id,label,matched:false}))).sort(()=>random()-.5)
export const loadProfiles = (stored:string|null): Profile[] => {
  if(!stored) return initialProfiles
  try { const value:unknown=JSON.parse(stored); return Array.isArray(value)&&value.length>0?value as Profile[]:initialProfiles } catch { return initialProfiles }
}
export const matchCards = (deck:Card[],ids:string[]) => {
  if(ids.length!==2) return {matched:false,deck}
  const cards=ids.map(id=>deck.find(card=>card.id===id))
  if(!cards[0]||cards[0].pairId!==cards[1]?.pairId) return {matched:false,deck}
  return {matched:true,deck:deck.map(card=>ids.includes(card.id)?{...card,matched:true}:card)}
}
export const awardStar = (profiles:Profile[],activeId:string) => profiles.map(profile=>profile.id===activeId?{...profile,stars:profile.stars+1}:profile)
