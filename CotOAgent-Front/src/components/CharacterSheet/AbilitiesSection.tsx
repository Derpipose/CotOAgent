import type { CharacterDto } from '../../DTOS/Character.Dto'
import { StatBox } from './StatBox'

type StatKey = keyof CharacterDto['Stats']

interface AbilitiesSectionProps {
  character: CharacterDto
  onStatChange: (statName: StatKey, value: number) => void
  onGenerateRandomStat: (statName: StatKey) => void
}

export function AbilitiesSection({
  character,
  onStatChange,
  onGenerateRandomStat,
}: AbilitiesSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="section-header">Abilities</h3>
      <div className="grid-stats">
        <StatBox
          label="Strength"
          statKey="Strength"
          value={character.Stats.Strength}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
        <StatBox
          label="Dexterity"
          statKey="Dexterity"
          value={character.Stats.Dexterity}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
        <StatBox
          label="Constitution"
          statKey="Constitution"
          value={character.Stats.Constitution}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
        <StatBox
          label="Intelligence"
          statKey="Intelligence"
          value={character.Stats.Intelligence}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
        <StatBox
          label="Wisdom"
          statKey="Wisdom"
          value={character.Stats.Wisdom}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
        <StatBox
          label="Charisma"
          statKey="Charisma"
          value={character.Stats.Charisma}
          onStatChange={onStatChange}
          onGenerateRandom={onGenerateRandomStat}
        />
      </div>
    </div>
  )
}
