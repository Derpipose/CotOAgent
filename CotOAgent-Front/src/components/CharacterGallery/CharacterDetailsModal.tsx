import CharacterStatsEdit from './CharacterStatsEdit'

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

interface EditedData {
  class_name: string
  race_name: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

interface CharacterDetailsModalProps {
  character: Character
  editedData: EditedData | null
  races: string[]
  classes: string[]
  onEditChange: (field: string, value: string | number) => void
  onClose: () => void
  onSaveRevision: () => void
  onSubmitRevision: () => void
  onDeleteCharacter: () => void
  isSubmitting?: boolean
}

export default function CharacterDetailsModal({
  character,
  editedData,
  races,
  classes,
  onEditChange,
  onClose,
  onSaveRevision,
  onSubmitRevision,
  onDeleteCharacter,
  isSubmitting = false,
}: CharacterDetailsModalProps) {
  if (!editedData) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{character.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="character-details">
            <div className="details-info">
              <div className="detail-row">
                <label className="detail-label">Class:</label>
                <select
                  value={editedData.class_name || ''}
                  onChange={(e) => onEditChange('class_name', e.target.value)}
                  className="detail-select"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="detail-row">
                <label className="detail-label">Race:</label>
                <select
                  value={editedData.race_name || ''}
                  onChange={(e) => onEditChange('race_name', e.target.value)}
                  className="detail-select"
                >
                  <option value="">Select a race</option>
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="character-stats">
              <h3>Character Stats</h3>
              <CharacterStatsEdit
                strength={editedData.strength}
                dexterity={editedData.dexterity}
                constitution={editedData.constitution}
                intelligence={editedData.intelligence}
                wisdom={editedData.wisdom}
                charisma={editedData.charisma}
                onStatChange={onEditChange}
              />
            </div>

            {character.feedback && (
              <div className="feedback-section">
                <p className="feedback-label">Feedback:</p>
                <p className="feedback-text">{character.feedback}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onDeleteCharacter} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete Character'}
          </button>
          <button className="btn btn-primary" onClick={onSaveRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Revision'}
          </button>
          <button className="btn btn-success" onClick={onSubmitRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Revision'}
          </button>
        </div>
      </div>
    </div>
  )
}
