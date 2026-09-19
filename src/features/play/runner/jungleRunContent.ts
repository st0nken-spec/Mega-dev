import type { GuardianAttack } from './guardian'

export const jungleStages = [
  { name: 'Trädkronorna', description: 'Lär dig hoppa, ducka och samla tre kunskapsfrön.' },
  { name: 'Flykten', description: 'Spring genom djungeln! Hoppa, ducka och välj rätt spår.' },
  { name: 'Vaktkatten', description: 'Undan attackerna, öppna skölden och träffa tre gånger.' },
] as const

export type TutorialStep = { kind: 'jump' | 'duck' | 'lane' | 'question'; prompt: string }

export const tutorialSteps = (fun: boolean): TutorialStep[] => fun
  ? [
      { kind: 'jump', prompt: 'En lian hänger i vägen - hoppa över den!' },
      { kind: 'duck', prompt: 'En gren sänker sig - ducka under!' },
      { kind: 'lane', prompt: 'Fröet ligger i ett annat spår - välj ett spår!' },
    ]
  : [
      { kind: 'jump', prompt: 'En lian hänger i vägen - hoppa över den!' },
      { kind: 'duck', prompt: 'En gren sänker sig - ducka under!' },
      { kind: 'question', prompt: 'Svara rätt för att plocka det sista fröet!' },
    ]

export const attackHint = (attack: GuardianAttack): string => attack.kind === 'duck'
  ? 'Vaktkatten slår högt - ducka!'
  : `Vaktkatten siktar på spår ${attack.lane + 1} - byt spår!`
