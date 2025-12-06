import SpellbookItem from './SpellbookItem';

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

interface BranchData {
  SpellBranch: string;
  spellbooks: SpellbookData[];
}

interface BranchItemProps {
  branch: BranchData;
  isExpanded: boolean;
  onToggleExpand: (branchName: string) => void;
  expandedBook: string | null;
  onToggleBook: (bookId: string) => void;
  expandedSpell: string | null;
  onToggleSpell: (spellId: string) => void;
}

export default function BranchItem({
  branch,
  isExpanded,
  onToggleExpand,
  expandedBook,
  onToggleBook,
  expandedSpell,
  onToggleSpell,
}: BranchItemProps) {
  return (
    <div className="branch-item-container">
      <button
        className="branch-item-button"
        onClick={() => onToggleExpand(branch.SpellBranch)}
      >
        <span className="branch-item-title">{branch.SpellBranch}</span>
        <span className={`branch-item-chevron ${isExpanded ? 'branch-item-chevron-expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="branch-item-content">
          {branch.spellbooks.map((book, index) => {
            const bookId = `${branch.SpellBranch}-book-${index}`;
            return (
              <SpellbookItem
                key={bookId}
                book={book}
                bookId={bookId}
                isExpanded={expandedBook === bookId}
                onToggleExpand={onToggleBook}
                expandedSpell={expandedSpell}
                onToggleSpell={onToggleSpell}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
