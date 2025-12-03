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
    <div className="border-b border-gray-300">
      <button
        className="flex items-center justify-between w-full px-4 py-3.5 bg-gray-50 border-none cursor-pointer transition-colors duration-200 text-sm text-left hover:bg-gray-100 active:bg-gray-200"
        onClick={() => onToggleExpand(spellId)}
      >
        <span className="flex-1 font-semibold text-gray-800 min-w-36">{spell.SpellName}</span>
        <span className="flex-0 flex-shrink-0 text-gray-600 text-xs text-center w-24">Mana: {spell.ManaCost}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-5 py-5 bg-white border-t border-gray-200 text-gray-700 leading-relaxed text-sm animate-slideDown">
          <div className="mb-3 pb-2 border-b border-gray-100">
            <strong>Hit Die:</strong> {spell.HitDie || 'N/A'}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 italic">
            {spell.Description}
          </div>
        </div>
      )}
    </div>
  );
}
