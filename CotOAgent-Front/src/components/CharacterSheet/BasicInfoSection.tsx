import type { CharacterDto } from '../../DTOS/Character.Dto'

interface BasicInfoSectionProps {
  character: CharacterDto
  loading: boolean
  classes: string[]
  races: string[]
  onNameChange: (name: string) => void
  onClassChange: (cls: string) => void
  onRaceChange: (race: string) => void
}

export function BasicInfoSection({
  character,
  loading,
  classes,
  races,
  onNameChange,
  onClassChange,
  onRaceChange,
}: BasicInfoSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="section-header">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="input-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Character Name</label>
          <input
            type="text"
            value={character.Name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter character name"
            className="input-large"
          />
        </div>
        <div className="input-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
          <select
            value={character.Class}
            onChange={(e) => onClassChange(e.target.value)}
            className="select-base"
            disabled={loading}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Race</label>
          <select
            value={character.Race}
            onChange={(e) => onRaceChange(e.target.value)}
            className="select-base"
            disabled={loading}
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
    </div>
  )
}
