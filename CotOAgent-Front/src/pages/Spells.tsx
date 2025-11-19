import { useEffect, useState } from 'react';
import '../css/displaycard.css';
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
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpellbooks = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('/api/spellbooks', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('text/html')) {
            throw new Error(`Backend returned HTML (${response.status}). Check if the backend URL is correct.`);
          }
          throw new Error(`Failed to fetch spellbooks: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setBranches(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('[Spells] Error: Request timeout (10s) - backend may be unreachable');
          setError('Request timeout - backend is not responding');
        } else {
          console.error('[Spells] Error:', errorMessage);
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSpellbooks();
  }, []);

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

  if (error) {
    return <div><h1>Spells</h1><p>Error: {error}</p></div>;
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
