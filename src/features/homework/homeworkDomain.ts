import type { TrackId } from '../../game'
import { homeworkSubjects, type HomeworkItem, type Stage } from './homeworkContent'

export const getSubject = (id: TrackId) =>
  homeworkSubjects.find(subject => subject.id === id) ?? homeworkSubjects[0]

export const makeWorksheet = (
  subjectId: TrackId,
  stage: Stage,
  random: () => number = Math.random,
): HomeworkItem[] =>
  [...getSubject(subjectId).items[stage]].sort(() => random() - .5)
