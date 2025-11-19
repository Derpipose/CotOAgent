interface Character {
  id: number
  name: string
  class_name: string | null
  race_name: string | null
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  created_at: string
  last_modified: string
  feedback: string | null
  approval_status: string | null
  revised: boolean
}

interface CharacterStatsDisplayProps {
  character: Character
  getStatColor: (statValue: number) => string
}

export default function CharacterStatsDisplay({ character, getStatColor }: CharacterStatsDisplayProps) {
  return (
    <div className="stats-grid">
      <div className={`stat ${getStatColor(character.strength)}`}>
        <div className="stat-label">STR</div>
        <div className="stat-value">{character.strength}</div>
      </div>
      <div className={`stat ${getStatColor(character.dexterity)}`}>
        <div className="stat-label">DEX</div>
        <div className="stat-value">{character.dexterity}</div>
      </div>
      <div className={`stat ${getStatColor(character.constitution)}`}>
        <div className="stat-label">CON</div>
        <div className="stat-value">{character.constitution}</div>
      </div>
      <div className={`stat ${getStatColor(character.intelligence)}`}>
        <div className="stat-label">INT</div>
        <div className="stat-value">{character.intelligence}</div>
      </div>
      <div className={`stat ${getStatColor(character.wisdom)}`}>
        <div className="stat-label">WIS</div>
        <div className="stat-value">{character.wisdom}</div>
      </div>
      <div className={`stat ${getStatColor(character.charisma)}`}>
        <div className="stat-label">CHA</div>
        <div className="stat-value">{character.charisma}</div>
      </div>
    </div>
  )
}
