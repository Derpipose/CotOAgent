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
  const getStatTailwindClasses = (colorClass: string) => {
    switch (colorClass) {
      case 'stat-excellent':
        return 'bg-green-100 border-green-500 text-green-900'
      case 'stat-good':
        return 'bg-blue-100 border-blue-500 text-blue-900'
      case 'stat-average':
        return 'bg-amber-100 border-amber-500 text-amber-900'
      case 'stat-poor':
        return 'bg-red-100 border-red-500 text-red-900'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900'
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.strength))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">STR</div>
        <div className="text-xl font-bold">{character.strength}</div>
      </div>
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.dexterity))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">DEX</div>
        <div className="text-xl font-bold">{character.dexterity}</div>
      </div>
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.constitution))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">CON</div>
        <div className="text-xl font-bold">{character.constitution}</div>
      </div>
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.intelligence))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">INT</div>
        <div className="text-xl font-bold">{character.intelligence}</div>
      </div>
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.wisdom))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">WIS</div>
        <div className="text-xl font-bold">{character.wisdom}</div>
      </div>
      <div className={`p-3 rounded-lg border-2 text-center transition-all ${getStatTailwindClasses(getStatColor(character.charisma))}`}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1">CHA</div>
        <div className="text-xl font-bold">{character.charisma}</div>
      </div>
    </div>
  )
}
