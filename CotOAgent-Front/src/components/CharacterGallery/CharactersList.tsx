import CharacterCard from './CharacterCard'

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

interface CharactersListProps {
  characters: Character[]
  onViewDetails: (character: Character) => void
  formatDate: (dateString: string) => string
  getStatColor: (statValue: number) => string
}

export default function CharactersList({
  characters,
  onViewDetails,
  formatDate,
  getStatColor,
}: CharactersListProps) {
  return (
    <div className="characters-grid">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onViewDetails={onViewDetails}
          formatDate={formatDate}
          getStatColor={getStatColor}
        />
      ))}
    </div>
  )
}
