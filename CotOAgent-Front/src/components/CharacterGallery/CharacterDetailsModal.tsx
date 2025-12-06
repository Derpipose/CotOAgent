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
      <div className="modal-content max-w-2xl w-full sm:w-auto mx-4 pt-24 sm:pt-6" onClick={(e) => e.stopPropagation()}>
        <div className="character-details-modal-header">
          <h2 className="character-details-modal-title">{character.name}</h2>
          <button className="character-details-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="character-details-modal-body">
          <div className="character-details-modal-content">
            <div className="character-details-modal-section">
              <div>
                <label className="character-details-modal-label">Class:</label>
                <select
                  value={editedData.class_name || ''}
                  onChange={(e) => onEditChange('class_name', e.target.value)}
                  className="character-details-modal-select w-full text-sm"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="character-details-modal-label">Race:</label>
                <select
                  value={editedData.race_name || ''}
                  onChange={(e) => onEditChange('race_name', e.target.value)}
                  className="character-details-modal-select w-full text-sm"
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

            <div>
              <h3 className="character-details-modal-stats-title">Character Stats</h3>
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
              <div className="character-details-modal-feedback">
                <p className="character-details-modal-feedback-title">Feedback:</p>
                <p className="character-details-modal-feedback-text">{character.feedback}</p>
              </div>
            )}
          </div>
        </div>

        <div className="character-details-modal-footer">
          <button className="btn-secondary w-full sm:w-auto" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="character-details-modal-button character-details-modal-button-delete" onClick={onDeleteCharacter} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
          <button className="character-details-modal-button character-details-modal-button-save" onClick={onSaveRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button className="character-details-modal-button character-details-modal-button-submit" onClick={onSubmitRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
