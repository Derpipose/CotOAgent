interface CharacterStatsEditProps {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  onStatChange: (field: string, value: number) => void
}

export default function CharacterStatsEdit({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  onStatChange,
}: CharacterStatsEditProps) {
  return (
    <div className="stats-grid-edit">
      <div className="stat-edit">
        <label className="stat-label">STR</label>
        <input
          type="number"
          value={strength}
          onChange={(e) => onStatChange('strength', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
      <div className="stat-edit">
        <label className="stat-label">DEX</label>
        <input
          type="number"
          value={dexterity}
          onChange={(e) => onStatChange('dexterity', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
      <div className="stat-edit">
        <label className="stat-label">CON</label>
        <input
          type="number"
          value={constitution}
          onChange={(e) => onStatChange('constitution', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
      <div className="stat-edit">
        <label className="stat-label">INT</label>
        <input
          type="number"
          value={intelligence}
          onChange={(e) => onStatChange('intelligence', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
      <div className="stat-edit">
        <label className="stat-label">WIS</label>
        <input
          type="number"
          value={wisdom}
          onChange={(e) => onStatChange('wisdom', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
      <div className="stat-edit">
        <label className="stat-label">CHA</label>
        <input
          type="number"
          value={charisma}
          onChange={(e) => onStatChange('charisma', parseInt(e.target.value, 10) || 0)}
          className="stat-input"
          min="1"
          max="20"
        />
      </div>
    </div>
  )
}
