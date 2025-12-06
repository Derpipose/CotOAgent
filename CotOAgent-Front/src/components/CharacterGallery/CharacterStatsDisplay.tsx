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
  const getStatClasses = (colorClass: string) => {
    switch (colorClass) {
      case 'stat-excellent':
        return 'character-stats-excellent'
      case 'stat-good':
        return 'character-stats-good'
      case 'stat-average':
        return 'character-stats-average'
      case 'stat-poor':
        return 'character-stats-poor'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900'
    }
  }

  return (
    <div className="character-stats-display-container">
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.strength))}`}>
        <div className="character-stats-label">STR</div>
        <div className="character-stats-value">{character.strength}</div>
      </div>
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.dexterity))}`}>
        <div className="character-stats-label">DEX</div>
        <div className="character-stats-value">{character.dexterity}</div>
      </div>
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.constitution))}`}>
        <div className="character-stats-label">CON</div>
        <div className="character-stats-value">{character.constitution}</div>
      </div>
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.intelligence))}`}>
        <div className="character-stats-label">INT</div>
        <div className="character-stats-value">{character.intelligence}</div>
      </div>
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.wisdom))}`}>
        <div className="character-stats-label">WIS</div>
        <div className="character-stats-value">{character.wisdom}</div>
      </div>
      <div className={`character-stats-box ${getStatClasses(getStatColor(character.charisma))}`}>
        <div className="character-stats-label">CHA</div>
        <div className="character-stats-value">{character.charisma}</div>
      </div>
    </div>
  )
}
