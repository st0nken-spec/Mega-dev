import { getTrack, type Difficulty, type TrackId } from '../../game'

export type Stage = 'forskola' | 'ak1'
export type HomeworkItem = { id: string; prompt: string; answer: string }
export type HomeworkSubject = {
  id: TrackId
  name: string
  shortName: string
  items: Record<Stage, HomeworkItem[]>
}

const stageDifficulty: Record<Stage, Difficulty> = { forskola: 1, ak1: 2 }

const fromTrack = (trackId: TrackId, stage: Stage): HomeworkItem[] =>
  getTrack(trackId).pairs[stageDifficulty[stage]].map(pair => ({ id: pair.id, prompt: pair.labels[0], answer: pair.labels[1] }))

export const homeworkSubjects: HomeworkSubject[] = [
  { id: 'math', name: 'Matte', shortName: '123', items: {
    forskola: [
      { id: 'count-1', prompt: 'Hur många prickar? ●', answer: '1' },
      { id: 'count-2', prompt: 'Hur många prickar? ● ●', answer: '2' },
      { id: 'count-3', prompt: 'Hur många prickar? ● ● ●', answer: '3' },
      { id: 'count-4', prompt: 'Hur många prickar? ● ● ● ●', answer: '4' },
      { id: 'count-5', prompt: 'Hur många prickar? ● ● ● ● ●', answer: '5' },
      { id: 'after-4', prompt: 'Vilket tal kommer efter 4?', answer: '5' },
    ],
    ak1: [
      { id: 'add-3-2', prompt: '3 + 2 = ?', answer: '5' },
      { id: 'sub-5-1', prompt: '5 − 1 = ?', answer: '4' },
      { id: 'add-7-3', prompt: '7 + 3 = ?', answer: '10' },
      { id: 'sub-9-4', prompt: '9 − 4 = ?', answer: '5' },
      { id: 'compare-12-21', prompt: 'Vilket tal är störst: 12 eller 21?', answer: '21' },
      { id: 'before-10', prompt: 'Vilket tal kommer före 10?', answer: '9' },
    ],
  }},
  { id: 'swedish', name: 'Svenska', shortName: 'ÅÄÖ', items: {
    forskola: [
      { id: 'sound-katt', prompt: 'Vilken bokstav börjar ordet KATT?', answer: 'K' },
      { id: 'sound-sol', prompt: 'Vilken bokstav börjar ordet SOL?', answer: 'S' },
      { id: 'rhyme-hus-mus', prompt: 'Rimmar HUS på MUS?', answer: 'Ja' },
      { id: 'rhyme-bil-tag', prompt: 'Rimmar BIL på TÅG?', answer: 'Nej' },
      { id: 'upper-a', prompt: 'Vad är stor bokstav av a?', answer: 'A' },
      { id: 'upper-b', prompt: 'Vad är stor bokstav av b?', answer: 'B' },
    ],
    ak1: [
      { id: 'fill-katt', prompt: 'Fyll i den saknade bokstaven: K_TT', answer: 'A' },
      { id: 'fill-sol', prompt: 'Fyll i den saknade bokstaven: S_L', answer: 'O' },
      { id: 'sentence-case', prompt: 'Ska en ny mening börja med stor eller liten bokstav?', answer: 'Stor' },
      { id: 'alpha-order', prompt: 'Vilket ord kommer först i bokstavsordning: BIL eller APA?', answer: 'APA' },
      { id: 'question-mark', prompt: 'Vilket skiljetecken avslutar en fråga?', answer: '?' },
      { id: 'spell-cat', prompt: 'Stava ordet för ett djur som säger "mjau".', answer: 'KATT' },
    ],
  }},
  { id: 'english', name: 'Engelska', shortName: 'ABC', items: {
    forskola: fromTrack('english', 'forskola'),
    ak1: fromTrack('english', 'ak1'),
  }},
  { id: 'knowledge', name: 'Kul fakta', shortName: '?', items: {
    forskola: fromTrack('knowledge', 'forskola'),
    ak1: fromTrack('knowledge', 'ak1'),
  }},
]
