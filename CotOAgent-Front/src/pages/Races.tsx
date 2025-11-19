import { useEffect, useState } from 'react';
import '../css/displaycard.css';
import { RaceSearchSection, RacesList } from '../components/Races';

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
  const [expandedRaceKey, setExpandedRaceKey] = useState<string | null>(null);
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
      setExpandedRaceKey(null);
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
    setExpandedRaceKey(null);
  };

  const toggleExpand = (raceKey: string) => {
    setExpandedRaceKey(expandedRaceKey === raceKey ? null : raceKey);
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
      <RaceSearchSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
        hasSearched={hasSearched}
        searchError={searchError}
        resultsCount={races.length}
      />
      <RacesList
        races={races}
        expandedRaceKey={expandedRaceKey}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
}
