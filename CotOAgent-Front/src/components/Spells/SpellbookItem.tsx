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
        className="flex items-center justify-between w-full px-3.5 py-3 bg-gray-100 border border-gray-300 cursor-pointer transition-colors duration-200 text-sm text-left hover:bg-gray-200 active:bg-gray-300"
        onClick={() => onToggleExpand(bookId)}
      >
        <span className="font-semibold text-gray-800 flex-1">{book.SpellBook}</span>
        <span className="flex-0 flex-shrink-0 text-gray-600 text-xs text-center w-20 px-3">{book.BookLevel}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="py-2.5 bg-gray-50">
          <div className="flex flex-col gap-0 border border-gray-300 border-t-0">
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
