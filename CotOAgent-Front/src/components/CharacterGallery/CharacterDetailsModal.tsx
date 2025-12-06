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
        <div className="flex justify-between items-center mb-6 pb-4 border-divider-bottom">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-500 m-0 break-words">{character.name}</h2>
          <button className="text-2xl sm:text-4xl font-light text-slate-600 hover:text-slate-700 bg-none border-none cursor-pointer p-2 flex-shrink-0" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto mb-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2">Class:</label>
                <select
                  value={editedData.class_name || ''}
                  onChange={(e) => onEditChange('class_name', e.target.value)}
                  className="select-base w-full text-sm"
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
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2">Race:</label>
                <select
                  value={editedData.race_name || ''}
                  onChange={(e) => onEditChange('race_name', e.target.value)}
                  className="select-base w-full text-sm"
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
              <h3 className="text-base sm:text-lg font-bold text-indigo-500 mb-3 sm:mb-4">Character Stats</h3>
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
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-indigo-400">
                <p className="text-xs font-bold text-slate-600 uppercase m-0 mb-2 tracking-wide">Feedback:</p>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed m-0 break-words">{character.feedback}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-divider">
          <button className="btn-secondary w-full sm:w-auto" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto" onClick={onDeleteCharacter} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
          <button className="px-3 sm:px-4 py-2 bg-indigo-200 hover:bg-indigo-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto" onClick={onSaveRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button className="px-3 sm:px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto" onClick={onSubmitRevision} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
