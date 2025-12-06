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
    <div className="spellbook-item-container">
      <button
        className="spellbook-item-button"
        onClick={() => onToggleExpand(bookId)}
      >
        <span className="spellbook-item-title">{book.SpellBook}</span>
        <span className="spellbook-item-level">{book.BookLevel}</span>
        <span className={`spellbook-item-chevron ${isExpanded ? 'spellbook-item-chevron-expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="spellbook-item-content">
          <div className="spellbook-item-spells">
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
