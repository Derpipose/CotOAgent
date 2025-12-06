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
    <div className="mb-4 border-2 border-blue-200">
      <button
        className="flex items-center justify-between w-full px-5 py-4 bg-blue-50 border-none cursor-pointer transition-colors duration-200 text-lg text-left hover:bg-blue-100 active:bg-blue-150"
        onClick={() => onToggleExpand(branch.SpellBranch)}
      >
        <span className="font-bold text-indigo-600 flex-1">{branch.SpellBranch}</span>
        <span className={`flex-0 w-7 h-7 flex items-center justify-center text-indigo-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="py-3 bg-blue-25">
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
