import type { CharacterDto } from '../../DTOS/Character.Dto'

type StatKey = keyof CharacterDto['Stats']

interface StatBoxProps {
  label: string
  statKey: StatKey
  value: number
  onStatChange: (statName: StatKey, value: number) => void
  onGenerateRandom: (statName: StatKey) => void
}

export function StatBox({ label, statKey, value, onStatChange, onGenerateRandom }: StatBoxProps) {
  return (
    <div className="stat-box-modern">
      <label className="stat-label-modern">{label}</label>
      <input
        type="number"
        min="10"
        max="18"
        value={value}
        onChange={(e) => onStatChange(statKey, parseInt(e.target.value) || 10)}
        className="stat-input"
      />
      <button onClick={() => onGenerateRandom(statKey)} className="stat-button-modern">
        Random
      </button>
    </div>
  )
}
