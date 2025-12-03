import CharacterStatsDisplay from './CharacterStatsDisplay'

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

interface CharacterCardProps {
  character: Character
  onViewDetails: (character: Character) => void
  formatDate: (dateString: string) => string
  getStatColor: (statValue: number) => string
}

export default function CharacterCard({
  character,
  onViewDetails,
  formatDate,
  getStatColor,
}: CharacterCardProps) {
  return (
    <div className="card-base hover:translate-y-[-8px] hover:shadow-2xl flex flex-col">
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex justify-between items-start gap-4">
        <h2 className="text-2xl font-bold m-0 flex-1 break-words">{character.name}</h2>
        <div className="flex gap-2 flex-wrap justify-end">
          {character.approval_status && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${
              character.approval_status.toLowerCase() === 'approved' ? 'bg-green-200 text-green-800' :
              character.approval_status.toLowerCase() === 'pending' ? 'bg-amber-200 text-amber-800' :
              'bg-red-200 text-red-800'
            }`}>
              {character.approval_status}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {character.class_name && (
            <div className="flex gap-2 text-sm">
              <span className="font-bold text-indigo-600 min-w-fit">Class:</span>
              <span className="text-gray-800">{character.class_name}</span>
            </div>
          )}
          {character.race_name && (
            <div className="flex gap-2 text-sm">
              <span className="font-bold text-indigo-600 min-w-fit">Race:</span>
              <span className="text-gray-800">{character.race_name}</span>
            </div>
          )}
        </div>

        <CharacterStatsDisplay character={character} getStatColor={getStatColor} />

        {character.feedback && (
          <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-indigo-600">
            <p className="text-xs font-bold text-gray-600 uppercase m-0 mb-2 tracking-wide">Feedback:</p>
            <p className="text-gray-800 text-sm leading-relaxed m-0 break-words">{character.feedback}</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <span className="whitespace-nowrap">Created: {formatDate(character.created_at)}</span>
          <span className="whitespace-nowrap">Modified: {formatDate(character.last_modified)}</span>
        </div>
        <button onClick={() => onViewDetails(character)} className="btn-primary-gradient text-sm py-2 px-4">
          View Details
        </button>
      </div>
    </div>
  )
}
