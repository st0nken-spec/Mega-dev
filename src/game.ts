export type Card = { id: string; value: number; matched: boolean }
export type Profile = { id: string; name: string; level: number; stars: number }
export const initialProfiles: Profile[] = [
  { id: 'explorer-1', name: 'Räven', level: 1, stars: 0 },
  { id: 'explorer-2', name: 'Björnen', level: 1, stars: 0 },
]
export const makeDeck = (random: () => number = Math.random): Card[] =>
  [1,2,3,1,2,3].map((value,index)=>({id:`${value}-${index}`,value,matched:false})).sort(()=>random()-.5)
export const loadProfiles = (stored: string | null): Profile[] => {
  if (!stored) return initialProfiles
  try {
    const value: unknown = JSON.parse(stored)
    return Array.isArray(value) && value.length > 0 ? value as Profile[] : initialProfiles
  } catch { return initialProfiles }
}
export const matchCards = (deck: Card[], ids: string[]) => {
  if (ids.length !== 2) return { matched: false, deck }
  const cards = ids.map(id=>deck.find(card=>card.id===id))
  if (!cards[0] || cards[0].value !== cards[1]?.value) return { matched:false, deck }
  return { matched:true, deck:deck.map(card=>ids.includes(card.id)?{...card,matched:true}:card) }
}
export const awardStar = (profiles: Profile[], activeId: string) => profiles.map(profile=>profile.id===activeId?{...profile,stars:profile.stars+1}:profile)
