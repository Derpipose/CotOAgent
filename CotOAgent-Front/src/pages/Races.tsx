import { useState } from 'react';
import { useQueryApi, useMutationApi } from '../hooks/useQueryApi';
import { RacesList } from '../components/Races';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { ContentCard } from '../components/ContentCard';

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
  const [expandedRaceKey, setExpandedRaceKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: allRaces = [], isLoading } = useQueryApi<RaceData[]>(
    '/races',
    {
      showError: true,
      errorMessage: 'Failed to load races',
    }
  );

  const searchMutation = useMutationApi<RaceData[], { query: string }>({
    mutationOptions: {
      mutationFn: async (variables) => {
        const response = await fetch('/api/races/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: variables.query }),
        });
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      },
    },
    showError: true,
    errorMessage: 'Failed to search races',
  });

  const displayedRaces = hasSearched ? searchMutation.data || [] : allRaces;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setSearchError(null);
    searchMutation.mutate({ query: searchQuery.trim() }, {
      onSuccess: () => {
        setHasSearched(true);
        setExpandedRaceKey(null);
      },
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchError(null);
    setExpandedRaceKey(null);
  };

  const toggleExpand = (raceKey: string) => {
    setExpandedRaceKey(expandedRaceKey === raceKey ? null : raceKey);
  };

  if (isLoading) {
    return <div><h1>Races</h1><p>Loading...</p></div>;
  }

  return (
    <div>
      <PageHeader 
        title="Races"
        subtitle="Explore the different races available in Chronicles of the Omuns"
      />
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        isSearching={searchMutation.isPending}
        hasSearched={hasSearched}
        searchError={searchError}
        resultsCount={displayedRaces.length}
        placeholder="Search races..."
      />
      <ContentCard>
        <RacesList
          races={displayedRaces}
          expandedRaceKey={expandedRaceKey}
          onToggleExpand={toggleExpand}
        />
      </ContentCard>
    </div>
  );
}
