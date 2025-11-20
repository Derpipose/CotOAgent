import { useEffect, useState } from 'react';
import '../css/displaycard.css';
import { useApiCall } from '../hooks/useApiCall';
import { SpellsContainer } from '../components/Spells';

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

export default function Spells() {
  const { call } = useApiCall();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpellbooks = async () => {
      const data = await call<BranchData[]>(
        '/spellbooks',
        undefined,
        {
          showError: true,
          errorMessage: 'Failed to load spellbooks',
        }
      );

      if (data) {
        setBranches(data);
      }
      setLoading(false);
    };

    fetchSpellbooks();
  }, [call]);

  const toggleExpandBranch = (branchName: string) => {
    setExpandedBranch(expandedBranch === branchName ? null : branchName);
  };

  const toggleExpandBook = (bookId: string) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  const toggleExpandSpell = (spellId: string) => {
    setExpandedSpell(expandedSpell === spellId ? null : spellId);
  };

  if (loading) {
    return <div><h1>Spells</h1><p>Loading...</p></div>;
  }

  return (
    <div>
      <h1>Spells</h1>
      <SpellsContainer
        branches={branches}
        expandedBranch={expandedBranch}
        onToggleBranch={toggleExpandBranch}
        expandedBook={expandedBook}
        onToggleBook={toggleExpandBook}
        expandedSpell={expandedSpell}
        onToggleSpell={toggleExpandSpell}
      />
    </div>
  );
}
