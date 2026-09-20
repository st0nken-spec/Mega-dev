// Shared tutorial-stage UI for HeroTraining and JungleRun: a progress dial
// and a single button that only ever performs the currently expected action.

export function TutorialProgressDots({ total, done, label }: { total: number; done: number; label: string }) {
  return <p className="runner-progress-dots" aria-label={label}>
    {Array.from({ length: total }, (_, index) => index < done ? '●' : '○').join(' ')}
  </p>
}

export function TutorialActionButton({ kind, onMove }: { kind: 'jump' | 'duck'; onMove: (kind: 'jump' | 'duck') => void }) {
  return <div className="runner-controls">
    <button className="block-button" onClick={() => onMove(kind)}>{kind === 'duck' ? 'Ducka' : 'Hoppa'}</button>
  </div>
}
