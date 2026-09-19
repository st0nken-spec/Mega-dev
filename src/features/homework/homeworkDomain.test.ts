import { describe,expect,it } from 'vitest'
import { homeworkSubjects } from './homeworkContent'
import { getSubject,makeWorksheet } from './homeworkDomain'

describe('homework domain',()=>{
  it('offers four subjects with six items per stage',()=>{
    expect(homeworkSubjects).toHaveLength(4)
    for(const subject of homeworkSubjects){
      expect(subject.items.forskola).toHaveLength(6)
      expect(subject.items.ak1).toHaveLength(6)
    }
  })
  it('falls back to math for an unknown subject id',()=>{expect(getSubject('nope' as never).id).toBe('math')})
  it('builds a worksheet with the full stage pack, shuffled',()=>{
    const worksheet=makeWorksheet('math','ak1',()=>.5)
    expect(worksheet).toHaveLength(6)
    expect(new Set(worksheet.map(item=>item.id)).size).toBe(6)
  })
  it('reuses the existing english and knowledge tracks unchanged',()=>{
    const english=getSubject('english')
    expect(english.items.forskola.map(item=>item.answer)).toEqual(expect.arrayContaining(['KATT','SOL','BIL']))
  })
})
