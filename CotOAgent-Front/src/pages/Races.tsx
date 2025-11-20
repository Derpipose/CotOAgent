import { useEffect, useState } from 'react';
import '../css/displaycard.css';
import { useApiCall } from '../hooks/useApiCall';
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
  const { call } = useApiCall();
  const [races, setRaces] = useState<RaceData[]>([]);
  const [allRaces, setAllRaces] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRaceKey, setExpandedRaceKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      const data = await call<RaceData[]>(
        '/races',
        undefined,
        {
          showError: true,
          errorMessage: 'Failed to load races',
        }
      );

      if (data) {
        setRaces(data);
        setAllRaces(data);
      }
      setLoading(false);
    };

    fetchRaces();
  }, [call]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const results = await call<RaceData[]>(
      '/races/search',
      {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery.trim() }),
      },
      {
        showError: true,
        errorMessage: 'Failed to search races',
      }
    );

    if (results) {
      setRaces(results);
      setHasSearched(true);
      setExpandedRaceKey(null);
    }
    setIsSearching(false);
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
