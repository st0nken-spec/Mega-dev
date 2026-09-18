import { describe, expect, it } from 'vitest'
import { awardStar, initialProfiles, loadProfiles, makeDeck, matchCards } from './game'
describe('game domain',()=>{
  it('builds three exact pairs',()=>{const values=makeDeck(()=>0.5).map(c=>c.value); expect(values.sort()).toEqual([1,1,2,2,3,3])})
  it('matches equal cards and leaves others',()=>{const deck=makeDeck(()=>0.5); const pair=deck.filter(c=>c.value===1).map(c=>c.id); const result=matchCards(deck,pair); expect(result.matched).toBe(true); expect(result.deck.filter(c=>c.matched)).toHaveLength(2)})
  it('does not mutate on mismatch or incomplete turn',()=>{const deck=makeDeck(()=>0.5); expect(matchCards(deck,[deck.find(c=>c.value===1)!.id,deck.find(c=>c.value===2)!.id])).toEqual({matched:false,deck}); expect(matchCards(deck,[deck[0].id])).toEqual({matched:false,deck})})
  it('awards only active profile',()=>{const result=awardStar(initialProfiles,'explorer-2'); expect(result.map(p=>p.stars)).toEqual([0,1])})
  it('falls back from missing, empty or corrupt storage',()=>{expect(loadProfiles(null)).toEqual(initialProfiles); expect(loadProfiles('[]')).toEqual(initialProfiles); expect(loadProfiles('{oops')).toEqual(initialProfiles)})
})
