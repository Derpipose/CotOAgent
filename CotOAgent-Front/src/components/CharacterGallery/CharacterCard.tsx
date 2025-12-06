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
    <div className="card-base character-card-container">
      <div className="character-card-header">
        <h2 className="character-card-title">{character.name}</h2>
        <div className="character-card-status-container">
          {character.approval_status && (
            <span className={`character-card-status ${
              character.approval_status.toLowerCase() === 'approved' ? 'character-card-status-approved' :
              character.approval_status.toLowerCase() === 'pending' ? 'character-card-status-pending' :
              'character-card-status-rejected'
            }`}>
              {character.approval_status}
            </span>
          )}
        </div>
      </div>

      <div className="character-card-body">
        <div className="character-card-info-group">
          {character.class_name && (
            <div className="character-card-info-row">
              <span className="character-card-info-label">Class:</span>
              <span className="character-card-info-value">{character.class_name}</span>
            </div>
          )}
          {character.race_name && (
            <div className="character-card-info-row">
              <span className="character-card-info-label">Race:</span>
              <span className="character-card-info-value">{character.race_name}</span>
            </div>
          )}
        </div>

        <CharacterStatsDisplay character={character} getStatColor={getStatColor} />

        {character.feedback && (
          <div className="character-card-feedback">
            <p className="character-card-feedback-title">Feedback:</p>
            <p className="character-card-feedback-text">{character.feedback}</p>
          </div>
        )}
      </div>

      <div className="character-card-footer">
        <div className="character-card-dates">
          <span className="character-card-date">Created: {formatDate(character.created_at)}</span>
          <span className="character-card-date">Modified: {formatDate(character.last_modified)}</span>
        </div>
        <button onClick={() => onViewDetails(character)} className="character-card-button">
          View Details
        </button>
      </div>
    </div>
  )
}
