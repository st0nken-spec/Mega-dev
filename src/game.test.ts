import { describe,expect,it } from 'vitest'
import { awardStar,getTrack,initialProfiles,loadProfiles,makeDeck,matchCards,resetStars,tracks } from './game'
describe('learning game domain',()=>{
  it('provides four curated tracks with two distinct levels',()=>{expect(tracks).toHaveLength(4);for(const track of tracks){expect(track.pairs[1]).toHaveLength(6);expect(track.pairs[2]).toHaveLength(6);expect(new Set([...track.pairs[1],...track.pairs[2]].map(p=>p.id)).size).toBe(12)}})
  it('builds three exact pairs for every track and level',()=>{for(const track of tracks)for(const level of [1,2] as const){const deck=makeDeck(track.id,level,()=>.5);expect(deck).toHaveLength(6);expect(new Set(deck.map(c=>c.pairId)).size).toBe(3)}})
  it('draws three pairs and excludes the previous round when alternatives exist',()=>{const first=makeDeck('math',1,()=>.5);const previous=[...new Set(first.map(card=>card.pairId))];const second=makeDeck('math',1,()=>.5,previous);expect(new Set(second.map(card=>card.pairId)).size).toBe(3);expect(second.every(card=>!previous.includes(card.pairId))).toBe(true)})
  it('matches related learning cards, not merely equal labels',()=>{const deck=makeDeck('english',1,()=>.5);const pair=deck.filter(c=>c.pairId==='cat').map(c=>c.id);const result=matchCards(deck,pair);expect(result.matched).toBe(true);expect(result.deck.filter(c=>c.matched)).toHaveLength(2)})
  it('does not mutate on mismatch or incomplete turn',()=>{const deck=makeDeck('math',1,()=>.5);expect(matchCards(deck,[deck[0].id])).toEqual({matched:false,deck});expect(matchCards(deck,[deck.find(c=>c.pairId==='one')!.id,deck.find(c=>c.pairId==='two')!.id])).toEqual({matched:false,deck})})
  it('awards only active profile',()=>{expect(awardStar(initialProfiles,'explorer-2').map(p=>p.stars)).toEqual([0,1])})
  it('resets only the target profile, leaving the other untouched',()=>{const starred=awardStar(awardStar(initialProfiles,'explorer-1'),'explorer-2');expect(resetStars(starred,'explorer-1').map(p=>p.stars)).toEqual([0,1])})
  it('falls back from missing, empty or corrupt storage',()=>{expect(loadProfiles(null)).toEqual(initialProfiles);expect(loadProfiles('[]')).toEqual(initialProfiles);expect(loadProfiles('{oops')).toEqual(initialProfiles)})
  it('falls back to math for an unknown runtime track',()=>{expect(getTrack('nope' as never).id).toBe('math')})
})
