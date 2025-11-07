import { useEffect, useState } from 'react';
import '../css/displaycard.css';

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
        const apiUrl = import.meta.env.VITE_API_URL;
        const isDevMode = apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '' && apiUrl.startsWith('http');
        
        let endpoint: string;
        if (isDevMode) {
          endpoint = `${apiUrl}/api/spellbooks`;
          console.log(`[Spells] Dev mode - fetching from: ${endpoint}`);
        } else {
          endpoint = '/api/spellbooks';
          console.log(`[Spells] Production mode - fetching from: ${endpoint}`);
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(endpoint, { signal: controller.signal });
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
      <div className="spellbooks-container">
        {branches.map((branch) => (
          <div key={branch.SpellBranch} className="branch-section">
            <button
              className="branch-header"
              onClick={() => toggleExpandBranch(branch.SpellBranch)}
            >
              <span className="branch-name">{branch.SpellBranch}</span>
              <span className={`expand-arrow ${expandedBranch === branch.SpellBranch ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedBranch === branch.SpellBranch && (
              <div className="branch-content">
                {branch.spellbooks.map((book, index) => {
                  const bookId = `${branch.SpellBranch}-book-${index}`;
                  return (
                    <div key={bookId} className="spellbook-header-wrapper">
                      <button
                        className="spellbook-header"
                        onClick={() => toggleExpandBook(bookId)}
                      >
                        <span className="spellbook-title">{book.SpellBook}</span>
                        <span className="spellbook-level">{book.BookLevel}</span>
                        <span className={`expand-arrow ${expandedBook === bookId ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      </button>
                      {expandedBook === bookId && (
                        <div className="spellbook-content">
                          <div className="spells-list">
                            {book.SpellDtos.map((spell) => {
                              const spellId = `${bookId}-${spell.SpellName}`;
                              return (
                                <div key={spellId} className="spell-item">
                                  <button
                                    className="spell-header"
                                    onClick={() => toggleExpandSpell(spellId)}
                                  >
                                    <span className="spell-name">{spell.SpellName}</span>
                                    <span className="spell-mana">Mana: {spell.ManaCost}</span>
                                    <span className={`expand-arrow ${expandedSpell === spellId ? 'expanded' : ''}`}>
                                      ▼
                                    </span>
                                  </button>
                                  {expandedSpell === spellId && (
                                    <div className="spell-details">
                                      <div className="spell-detail-item">
                                        <strong>Hit Die:</strong> {spell.HitDie || 'N/A'}
                                      </div>
                                      <div className="spell-description">
                                        {spell.Description}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
