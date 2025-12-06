import SpellItem from './SpellItem';

interface SpellData {
  SpellName: string;
  ManaCost: number;
  HitDie: string;
  Description: string;
}

interface SpellbookData {
  SpellBranch: string;
  SpellBook: string;
  BookLevel: string;
  SpellDtos: SpellData[];
}

interface SpellbookItemProps {
  book: SpellbookData;
  bookId: string;
  isExpanded: boolean;
  onToggleExpand: (bookId: string) => void;
  expandedSpell: string | null;
  onToggleSpell: (spellId: string) => void;
}

export default function SpellbookItem({
  book,
  bookId,
  isExpanded,
  onToggleExpand,
  expandedSpell,
  onToggleSpell,
}: SpellbookItemProps) {
  return (
    <div className="mb-3 px-3">
      <button
        className="flex items-center justify-between w-full px-3.5 py-3 bg-blue-100 border border-blue-200 cursor-pointer transition-colors duration-200 text-sm text-left hover:bg-blue-150 active:bg-blue-200"
        onClick={() => onToggleExpand(bookId)}
      >
        <span className="font-semibold text-indigo-600 flex-1">{book.SpellBook}</span>
        <span className="flex-0 flex-shrink-0 text-slate-600 text-xs text-center w-20 px-3">{book.BookLevel}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-indigo-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="py-2.5 bg-blue-100">
          <div className="flex flex-col gap-0">
            {book.SpellDtos.map((spell) => {
              const spellId = `${bookId}-${spell.SpellName}`;
              return (
                <SpellItem
                  key={spellId}
                  spell={spell}
                  spellId={spellId}
                  isExpanded={expandedSpell === spellId}
                  onToggleExpand={onToggleSpell}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
