interface SpellData {
  SpellName: string;
  ManaCost: number;
  HitDie: string;
  Description: string;
}

interface SpellItemProps {
  spell: SpellData;
  spellId: string;
  isExpanded: boolean;
  onToggleExpand: (spellId: string) => void;
}

export default function SpellItem({ spell, spellId, isExpanded, onToggleExpand }: SpellItemProps) {
  return (
    <div className="spell-item-container">
      <button
        className="spell-item-button"
        onClick={() => onToggleExpand(spellId)}
      >
        <span className="spell-item-name">{spell.SpellName}</span>
        <span className="spell-item-mana">Mana: {spell.ManaCost}</span>
        <span className={`spell-item-chevron ${isExpanded ? 'spell-item-chevron-expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="spell-item-content">
          <div className="spell-item-hit-die">
            <strong>Hit Die:</strong> {spell.HitDie || 'N/A'}
          </div>
          <div className="spell-item-description">
            {spell.Description}
          </div>
        </div>
      )}
    </div>
  );
}
