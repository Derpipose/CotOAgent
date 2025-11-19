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
    <div className="character-card">
      <div className="card-header">
        <h2 className="character-name">{character.name}</h2>
        <div className="card-meta">
          {character.approval_status && (
            <span className={`approval-badge approval-${character.approval_status.toLowerCase()}`}>
              {character.approval_status}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="character-info">
          {character.class_name && (
            <div className="info-row">
              <span className="label">Class:</span>
              <span className="value">{character.class_name}</span>
            </div>
          )}
          {character.race_name && (
            <div className="info-row">
              <span className="label">Race:</span>
              <span className="value">{character.race_name}</span>
            </div>
          )}
        </div>

        <CharacterStatsDisplay character={character} getStatColor={getStatColor} />

        {character.feedback && (
          <div className="feedback-section">
            <p className="feedback-label">Feedback:</p>
            <p className="feedback-text">{character.feedback}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="dates">
          <span className="date-created">Created: {formatDate(character.created_at)}</span>
          <span className="date-modified">Modified: {formatDate(character.last_modified)}</span>
        </div>
        <button onClick={() => onViewDetails(character)} className="btn btn-small">
          View Details
        </button>
      </div>
    </div>
  )
}
