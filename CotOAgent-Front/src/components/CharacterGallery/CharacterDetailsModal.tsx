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
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 m-0">{character.name}</h2>
          <button className="text-4xl font-light text-gray-600 hover:text-gray-900 bg-none border-none cursor-pointer p-2" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto mb-6">
          <div className="space-y-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Class:</label>
                <select
                  value={editedData.class_name || ''}
                  onChange={(e) => onEditChange('class_name', e.target.value)}
                  className="select-base w-full"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Race:</label>
                <select
                  value={editedData.race_name || ''}
                  onChange={(e) => onEditChange('race_name', e.target.value)}
                  className="select-base w-full"
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Character Stats</h3>
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
              <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-indigo-600">
                <p className="text-xs font-bold text-gray-600 uppercase m-0 mb-2 tracking-wide">Feedback:</p>
                <p className="text-gray-800 text-sm leading-relaxed m-0 break-words">{character.feedback}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed" onClick={onDeleteCharacter} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete Character'}
          </button>
          <button className="btn-primary-gradient py-2 px-4" onClick={onSaveRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Revision'}
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed" onClick={onSubmitRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Revision'}
          </button>
        </div>
      </div>
    </div>
  )
}
