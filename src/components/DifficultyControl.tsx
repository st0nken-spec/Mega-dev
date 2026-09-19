import type { Difficulty } from '../game'

export function DifficultyControl({ value, onChange }: { value: Difficulty; onChange: (value: Difficulty) => void }) {
  return <div className="difficulty-control" role="group" aria-label="Välj nivå">
    {([1, 2] as Difficulty[]).map(level => <button
      aria-pressed={value === level}
      className={value === level ? 'level active' : 'level'}
      key={level}
      onClick={() => onChange(level)}
    >Nivå {level}</button>)}
  </div>
}
