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
    <div className="spellbook-header-wrapper">
      <button
        className="spellbook-header"
        onClick={() => onToggleExpand(bookId)}
      >
        <span className="spellbook-title">{book.SpellBook}</span>
        <span className="spellbook-level">{book.BookLevel}</span>
        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="spellbook-content">
          <div className="spells-list">
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
