export const heroStages = [
  { name: 'Träningsbanan', description: 'Hoppa och ducka dig igenom banan - inget kan gå fel.' },
  { name: 'Löparleden', description: 'Spring snabbare! Hoppa, ducka och välj rätt spår.' },
  { name: 'Portvakten', description: 'Blockera attackerna och fyll styrkemätaren.' },
] as const

export type CourseStep = { kind: 'jump' | 'duck'; prompt: string }

export const courseSteps: CourseStep[] = [
  { kind: 'jump', prompt: 'Hoppa över stocken!' },
  { kind: 'duck', prompt: 'Ducka under bjälken!' },
  { kind: 'jump', prompt: 'Hoppa upp på stenen!' },
  { kind: 'duck', prompt: 'Ducka under repet!' },
  { kind: 'jump', prompt: 'Sista hindret - hoppa!' },
]

export const gateHint = 'Portvakten slår till - blockera!'
