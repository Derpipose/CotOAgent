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
    <div className="spell-item">
      <button
        className="spell-header"
        onClick={() => onToggleExpand(spellId)}
      >
        <span className="spell-name">{spell.SpellName}</span>
        <span className="spell-mana">Mana: {spell.ManaCost}</span>
        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="spell-details">
          <div className="spell-detail-item">
            <strong>Hit Die:</strong> {spell.HitDie || 'N/A'}
          </div>
          <div className="spell-description">
            {spell.Description}
          </div>
        </div>
      )}
    </div>
  );
}
