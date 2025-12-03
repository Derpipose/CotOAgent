import BranchItem from './BranchItem';

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

interface SpellsContainerProps {
  branches: BranchData[];
  expandedBranch: string | null;
  onToggleBranch: (branchName: string) => void;
  expandedBook: string | null;
  onToggleBook: (bookId: string) => void;
  expandedSpell: string | null;
  onToggleSpell: (spellId: string) => void;
}

export default function SpellsContainer({
  branches,
  expandedBranch,
  onToggleBranch,
  expandedBook,
  onToggleBook,
  expandedSpell,
  onToggleSpell,
}: SpellsContainerProps) {
  return (
    <div className="mt-5 ml-auto mr-auto w-11/12 px-4 box-border">
      {branches.map((branch) => (
        <BranchItem
          key={branch.SpellBranch}
          branch={branch}
          isExpanded={expandedBranch === branch.SpellBranch}
          onToggleExpand={onToggleBranch}
          expandedBook={expandedBook}
          onToggleBook={onToggleBook}
          expandedSpell={expandedSpell}
          onToggleSpell={onToggleSpell}
        />
      ))}
    </div>
  );
}
