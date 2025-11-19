import { useEffect, useState } from 'react';
import '../css/displaycard.css';

interface RaceData {
  id?: number;
  Campaign: string;
  SubType?: string;
  Name: string;
  Description: string;
  Starter?: string;
  Special?: string;
  Pinterest_Inspo_Board?: string;
  Distance?: number;
}

export default function Races() {
  const [races, setRaces] = useState<RaceData[]>([]);
  const [allRaces, setAllRaces] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRaceId, setExpandedRaceId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/races', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('text/html')) {
            throw new Error(`Backend returned HTML (${response.status}). Check if the backend URL is correct.`);
          }
          throw new Error(`Failed to fetch races: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setRaces(data);
        setAllRaces(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('[Races] Error: Request timeout (10s) - backend may be unreachable');
          setError('Request timeout - backend is not responding');
        } else {
          console.error('[Races] Error:', errorMessage);
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const endpoint = '/api/races/search';

      console.log(`[Races] Searching for: "${searchQuery}" via ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search races: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();
      setRaces(results);
      setHasSearched(true);
      setExpandedRaceId(null);
      console.log(`[Races] Search returned ${results.length} results`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      console.error('[Races] Search error:', errorMessage);
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setRaces(allRaces);
    setHasSearched(false);
    setSearchError(null);
    setExpandedRaceId(null);
  };

  const toggleExpand = (raceId: number | undefined) => {
    if (raceId === undefined) return;
    setExpandedRaceId(expandedRaceId === raceId ? null : raceId);
  };

  if (loading) {
    return <div><h1>Races</h1><p>Loading...</p></div>;
  }

  if (error) {
    return <div><h1>Races</h1><p>Error: {error}</p></div>;
  }

  return (
    <div>
      <h1>Races</h1>
      
      {/* Search Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter race description or characteristics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              opacity: isSearching ? 0.6 : 1,
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {hasSearched && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Search
            </button>
          )}
        </div>
        {searchError && (
          <p style={{ color: 'red', margin: '10px 0 0 0', fontSize: '14px' }}>
            {searchError}
          </p>
        )}
        {hasSearched && (
          <p style={{ color: '#666', margin: '10px 0 0 0', fontSize: '14px' }}>
            Showing {races.length} results
          </p>
        )}
      </div>

      <div className="races-list">
        {races.map((race) => (
          <div key={`${race.id}-${race.Name}-${race.Campaign}`} className="race-item">
            <button
              className="race-header"
              onClick={() => toggleExpand(race.id)}
            >
              <span className="race-name">{race.Name}</span>
              <span className="race-campaign">{race.Campaign}</span>
              <span className={`expand-arrow ${expandedRaceId === race.id ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedRaceId === race.id && (
              <div className="race-description">
                {race.Description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
