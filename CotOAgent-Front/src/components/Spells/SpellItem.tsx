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
    <div className="px-3 mb-2">
      <button
        className="flex items-center justify-between w-full px-4 py-3.5 bg-blue-50 border-none cursor-pointer transition-colors duration-200 text-lg text-left hover:bg-blue-200 active:bg-blue-250"
        onClick={() => onToggleExpand(spellId)}
      >
        <span className="flex-1 font-semibold text-indigo-600 min-w-36">{spell.SpellName}</span>
        <span className="flex-0 flex-shrink-0 text-slate-600 text-sm text-center w-24">Mana: {spell.ManaCost}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-indigo-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-5 py-5 bg-blue-50 text-slate-700 leading-relaxed text-sm animate-slideDown">
          <div className="mb-3">
            <strong>Hit Die:</strong> {spell.HitDie || 'N/A'}
          </div>
          <div className="mt-4 italic">
            {spell.Description}
          </div>
        </div>
      )}
    </div>
  );
}
